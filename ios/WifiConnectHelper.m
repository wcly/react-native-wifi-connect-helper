#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WifiConnectHelper, NSObject)

RCT_EXTERN_METHOD(getCurrentWifiSSID:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

@end
