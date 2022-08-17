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
        print("RNWIFI:Init")
        solved = true
        if #available(iOS 13, *) {
            locationManager = CLLocationManager()
            locationManager?.delegate = self
        }
    }
    
    @objc(connectToProtectedSSID:withPassphrase:WithIsWEP:withResolver:withRejecter:)
    func connectToProtectedSSID(ssid: String, passphrase: String, isWEP: Bool, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
    }
    
    /**
     获取当前连接的wifi名称
     */
    @objc(getCurrentWifiSSID:withRejecter:)
    func getCurrentWifiSSID(resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock) -> Void {
        if #available(iOS 13, *) {
            // 检查权限给了没
            if CLLocationManager.authorizationStatus() == CLAuthorizationStatus.denied {
                print("RNWIFI:ERROR:Cannot detect SSID because LocationPermission is Denied ")
                reject(ConnectErrorCode.LocationPermissionDenied.code, "Cannot detect SSID because LocationPermission is Denied", nil)
            }
            if CLLocationManager.authorizationStatus() == CLAuthorizationStatus.restricted {
                print("RNWIFI:ERROR:Cannot detect SSID because LocationPermission is Restricted ")
                reject(ConnectErrorCode.LocationPermissionRestricted.code, "Cannot detect SSID because LocationPermission is Restricted", nil)
            }
        }
        
        
        let hasLocationPermission = CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedWhenInUse || CLLocationManager.authorizationStatus() == CLAuthorizationStatus.authorizedAlways
        if #available(iOS 13, *), !hasLocationPermission {
            // Need request LocationPermission or HotSpot or have VPN connection
            // https://forums.developer.apple.com/thread/117371#364495
            locationManager?.requestWhenInUseAuthorization()
            self.solved = false;
            NotificationCenter.default.addObserver(forName: NSNotification.Name("RNWIFI:authorizationStatus"), object: nil, queue: nil) { Notification in
                
                if !self.solved {
                    if hasLocationPermission {
                        self.getWifiSSID { SSID in
                            if (SSID != nil) {
                                resolve(SSID)
                                return
                            }
                            print("RNWIFI:ERROR:Cannot detect SSID")
                            reject(ConnectErrorCode.CouldNotDetectSSID.code, "Cannot detect SSID", nil)
                        }

                    }else {
                        reject(ConnectErrorCode.LocationPermissionDenied.code, "Permission not granted", nil)
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
                print("RNWIFI:ERROR:Cannot detect SSID")
                reject(ConnectErrorCode.CouldNotDetectSSID.code, "Cannot detect SSID", nil)
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
}
