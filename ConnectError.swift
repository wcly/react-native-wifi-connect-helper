//
//  ConnectError.swift
//  react-native-wifi-connect-helper
//
//  Created by weixiaolin on 2022/8/16.
//

import Foundation
enum ConnectErrorCode {
    case UnavailableForOSVersion
    case Invalid
    case InvalidSSID
    case InvalidSSIDPrefix
    case InvalidPassphrase
    case UserDenied
    case UnableToConnect
    case LocationPermissionDenied
    case LocationPermissionRestricted
    case DidNotFindNetwork
    case CouldNotDetectSSID
    
    var code : String {
        switch self {

        case .UnavailableForOSVersion:
            return "UnavailableForOSVersion"
        case .Invalid:
            return "Invalid"
        case .InvalidSSID:
            return "InvalidSSID"
        case .InvalidSSIDPrefix:
            return "InvalidSSIDPrefix"
        case .InvalidPassphrase:
            return "InvalidPassphrase"
        case .UserDenied:
            return "UserDenied"
        case .UnableToConnect:
            return "UnableToConnect"
        case .LocationPermissionDenied:
            return "LocationPermissionDenied"
        case .LocationPermissionRestricted:
            return "LocationPermissionRestricted"
        case .DidNotFindNetwork:
            return "DidNotFindNetwork"
        case .CouldNotDetectSSID:
            return "CouldNotDetectSSID"
        }
    }
}
