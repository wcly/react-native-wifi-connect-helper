import CoreLocation
import NetworkExtension
import SystemConfiguration
import UIKit
import SystemConfiguration.CaptiveNetwork

@objc(WifiConnectHelper)
class WifiConnectHelper: NSObject, CLLocationManagerDelegate {
    private var locationManager: CLLocationManager?
    private var solved = false
    
    override init() {
        super.init()
        print("WifiConnectHelper:Init")
        solved = true
        if #available(iOS 13, *) {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
        }
    }
    
    /**
     检查是定位否打开
     */
    @objc(checkIsGPSEnable:withRejecter:)
    func checkIsGPSEnable(resolve:RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock){
        resolve(CLLocationManager.locationServicesEnabled())
    }
    
    /**
     检查是wifi否打开
     */
    @objc(checkIsWifiEnable:withRejecter:)
    func checkIsWifiEnable(resolve:RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock) {
        var hasWiFiNetwork: Bool = false
        let interfaces: NSArray = CFBridgingRetain(CNCopySupportedInterfaces()) as! NSArray
        for interface in interfaces {
            // let networkInfo = (CFBridgingRetain(CNCopyCurrentNetworkInfo(((interface) as! CFString))) as! NSDictionary)
            let networkInfo: [AnyHashable: Any]? = CFBridgingRetain(CNCopyCurrentNetworkInfo(((interface) as! CFString))) as? [AnyHashable : Any]
            if (networkInfo != nil){ hasWiFiNetwork = true
                break
                
            }
        }
        resolve(hasWiFiNetwork);
    }
    
    /**
     连接wifi
     */
    @objc(connectToProtectedSSIDOnce:withPassphrase:withIsWEP:withJoinOnce:withResolver:withRejecter:)
    func connectToProtectedSSIDOnce(ssid: String, passphrase: String, isWEP: Bool, joinOnce: Bool, resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock) -> Void {
        self.getWifiSSID { resultSSID in
            // 已经连上了，直接返回
            if resultSSID == ssid {
                resolve(nil)
                return
            }
            
            if #available(iOS 11, *) {
                var configuration = NEHotspotConfiguration()
                // 检查是不是开放网络
                if passphrase.count == 0 {
                    configuration = NEHotspotConfiguration.init(ssid: ssid)
                }else {
                    configuration = NEHotspotConfiguration.init(ssid: ssid, passphrase: passphrase, isWEP: isWEP)
                }
                configuration.joinOnce = joinOnce
                
                NEHotspotConfigurationManager.shared.apply(configuration) { error in
                    if error != nil {
                        reject(self.parseError(error), error?.localizedDescription, error)
                    }else {
                        // 检查是否连接成功
                        self.getWifiSSID { newSSID in
                            if ssid == newSSID {
                                resolve(nil)
                            }else {
                                reject(ConnectError.UnableToConnect.code, "Unable to connect to \(ssid)", nil)
                            }
                        }
                    }
                }
            }else {
                reject(ConnectError.UnavailableForOSVersion.code, "Not supported in iOS<11.0", nil)
            }
        }
    }
    
    /**
     获取当前连接的wifi名称
     */
    @objc(getCurrentWifiSSID:withRejecter:)
    func getCurrentWifiSSID(resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock) -> Void {
        if #available(iOS 13, *) {
            // 检查权限给了没
            if CLLocationManager.authorizationStatus() == CLAuthorizationStatus.denied {
                print("WifiConnectHelper:ERROR:Cannot detect SSID because LocationPermission is Denied ")
                reject(ConnectError.LocationPermissionDenied.code, "Cannot detect SSID because LocationPermission is Denied", nil)
            }
            if CLLocationManager.authorizationStatus() == CLAuthorizationStatus.restricted {
                print("WifiConnectHelper:ERROR:Cannot detect SSID because LocationPermission is Restricted ")
                reject(ConnectError.LocationPermissionRestricted.code, "Cannot detect SSID because LocationPermission is Restricted", nil)
            }
        }
        
        
        let hasLocationPermission = CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedWhenInUse || CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedAlways
        if #available(iOS 13, *), !hasLocationPermission {
            // Need request LocationPermission or HotSpot or have VPN connection
            // https://forums.developer.apple.com/thread/117371#364495
            locationManager?.requestWhenInUseAuthorization()
            self.solved = false;
            NotificationCenter.default.addObserver(forName: NSNotification.Name("WifiConnectHelper:authorizationStatus"), object: nil, queue: nil) { Notification in
                
                if !self.solved {
                    if hasLocationPermission {
                        self.getWifiSSID { SSID in
                            if (SSID != nil) {
                                resolve(SSID)
                                return
                            }
                            print("WifiConnectHelper:ERROR:Cannot detect SSID")
                            reject(ConnectError.CouldNotDetectSSID.code, "Cannot detect SSID", nil)
                        }

                    }else {
                        reject(ConnectError.LocationPermissionDenied.code, "Permission not granted", nil)
                    }
                }
                self.solved = true
            }
        }else {
            self.getWifiSSID { SSID in
                if (SSID != nil) {
                    resolve(SSID)
                    return
                }
                print("WifiConnectHelper:ERROR:Cannot detect SSID")
                reject(ConnectError.CouldNotDetectSSID.code, "Cannot detect SSID", nil)
            }
        }
    }
    
    func getWifiSSID(cb: @escaping (_ SSID: String?) -> Void){
        if #available(iOS 14.0, *) {
            NEHotspotNetwork.fetchCurrent(completionHandler: { currentNetwork in
                let SSID = currentNetwork?.ssid
                cb(SSID)
           })
        }else {
            let kSSID = kCNNetworkInfoKeySSID;
            
            let ifs = CNCopySupportedInterfaces()
            if let array = ifs as [AnyObject]? {
                for item in array {
                    if (item[kSSID] != nil) {
                        cb((item[kSSID] as! String))
                        return
                    }
                }
            }
            cb(nil)
        }
    }
    
    func parseError(_ error: Error?) -> String {
        if #available(iOS 11, *) {

            if error == nil {
                return ConnectError.UnableToConnect.code
            }

            /*
                     NEHotspotConfigurationErrorInvalid                         = 0,
                     NEHotspotConfigurationErrorInvalidSSID                     = 1,
                     NEHotspotConfigurationErrorInvalidWPAPassphrase            = 2,
                     NEHotspotConfigurationErrorInvalidWEPPassphrase            = 3,
                     NEHotspotConfigurationErrorInvalidEAPSettings              = 4,
                     NEHotspotConfigurationErrorInvalidHS20Settings             = 5,
                     NEHotspotConfigurationErrorInvalidHS20DomainName           = 6,
                     NEHotspotConfigurationErrorUserDenied                      = 7,
                     NEHotspotConfigurationErrorInternal                        = 8,
                     NEHotspotConfigurationErrorPending                         = 9,
                     NEHotspotConfigurationErrorSystemConfiguration             = 10,
                     NEHotspotConfigurationErrorUnknown                         = 11,
                     NEHotspotConfigurationErrorJoinOnceNotSupported            = 12,
                     NEHotspotConfigurationErrorAlreadyAssociated               = 13,
                     NEHotspotConfigurationErrorApplicationIsNotInForeground    = 14,
                     NEHotspotConfigurationErrorInvalidSSIDPrefix               = 15
                     */

            switch (error as NSError?)?.code {
            case NEHotspotConfigurationError.invalid.rawValue:
                return ConnectError.Invalid.code
            case NEHotspotConfigurationError.invalidSSID.rawValue:
                return ConnectError.InvalidSSID.code
            case NEHotspotConfigurationError.invalidSSIDPrefix.rawValue:
                return ConnectError.InvalidSSIDPrefix.code
            case NEHotspotConfigurationError.invalidWEPPassphrase.rawValue, NEHotspotConfigurationError.invalidWPAPassphrase.rawValue:
                return ConnectError.InvalidPassphrase.code
            case NEHotspotConfigurationError.userDenied.rawValue:
                return ConnectError.UserDenied.code
            default:
                return ConnectError.UnableToConnect.code
            }
        }
        return ConnectError.UnavailableForOSVersion.code
    }
}
