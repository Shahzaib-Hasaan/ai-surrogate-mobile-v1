import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

cssInterop(SafeAreaView, { className: 'style' });

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <UserProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
                </Stack>
            </UserProvider>
        </SafeAreaProvider>
    );
}
