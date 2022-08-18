#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WifiConnectHelper, NSObject)

RCT_EXTERN_METHOD(getCurrentWifiSSID:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectToSSID:(NSString*)ssid
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectToProtectedSSID:(NSString*)ssid
                  withPassphrase:(NSString*)passphrase
                  withIsWEP:(BOOL)isWEP
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectToProtectedSSIDOnce:(NSString*)ssid
                  withPassphrase:(NSString*)passphrase
                  withIsWEP:(BOOL)isWEP
                  withJoinOnce:(BOOL)joinOnce
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
@end
