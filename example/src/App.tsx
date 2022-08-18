import React, { useState } from 'react';

import {
  StyleSheet,
  Button,
  Text,
  Linking,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  View,
  Dimensions,
} from 'react-native';
import {
  openGPSSetting,
  openWifiSetting,
  getCurrentWifiSSID,
  checkIsWifiEnable,
  checkIsGPSEnable,
  loadWifiList,
  connectToProtectedSSID,
} from 'react-native-wifi-connect-helper';

const IS_ANDROID = Platform.OS === 'android';

export default function App() {
  const [wifiName, setWifiName] = useState('');
  const [isGPSEnabled, setIsGPSEnabled] = useState(false);
  const [isWfiEnabled, setIsWfiEnabled] = useState(false);
  const [wifiList, setWifiList] = useState<any[]>([]);
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="position">
        {IS_ANDROID && (
          <View style={styles.block}>
            <Button title="去gps页面" onPress={() => openGPSSetting()} />
          </View>
        )}

        {IS_ANDROID && (
          <View style={styles.block}>
            <Button title="去wifi页面" onPress={() => openWifiSetting()} />
          </View>
        )}

        <View style={styles.block}>
          <Button title="去设置页面" onPress={() => Linking.openSettings()} />
        </View>

        <View style={styles.block}>
          <Button
            title="检查GPS是否开启"
            onPress={async () => {
              const bool = await checkIsGPSEnable();
              setIsGPSEnabled(bool);
            }}
          />
          <Text>gps开启：{isGPSEnabled?.toString()}</Text>
        </View>

        <View style={styles.block}>
          <Button
            title="检查wifi是否开启"
            onPress={async () => {
              const bool = await checkIsWifiEnable();
              setIsWfiEnabled(bool);
            }}
          />
          <Text>wif开启：{isWfiEnabled?.toString()}</Text>
        </View>

        <View style={styles.block}>
          <Button
            title="获取当前连接的wifi"
            onPress={async () => {
              const ssid = await getCurrentWifiSSID();
              setWifiName(ssid);
            }}
          />
          <Text>wifi名称：{wifiName}</Text>
        </View>

        {IS_ANDROID && (
          <View style={styles.block}>
            <Button
              title="获取wifi列表"
              onPress={async () => {
                const result = await loadWifiList();
                setWifiList(result);
              }}
            />
            <ScrollView>
              {wifiList?.map((item) => (
                <Text key={item.BSSID}>
                  {item.SSID} / {item.BSSID}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.block}>
          <Text>连接wifi</Text>
          <TextInput
            value={wifiName}
            placeholder="请输入wifi名称"
            onChangeText={(text) => setWifiName(text)}
          />
          <TextInput
            placeholder="请输入wifi密码"
            onChangeText={(text) => setPassword(text)}
          />
          <Button
            onPress={async () => {
              try {
                const res = await connectToProtectedSSID(wifiName, password);
                console.log(res);
              } catch (err) {
                console.log('err', err);
              }
            }}
            title="开始连接"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  block: {
    width: Dimensions.get('window').width,
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
