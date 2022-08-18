#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WifiConnectHelper, NSObject)

RCT_EXTERN_METHOD(getCurrentWifiSSID:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectToProtectedSSIDOnce:(NSString*)ssid
                  withPassphrase:(NSString*)passphrase
                  withIsWEP:(BOOL)isWEP
                  withJoinOnce:(BOOL)joinOnce
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkIsGPSEnable:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(checkIsWifiEnable:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
@end
