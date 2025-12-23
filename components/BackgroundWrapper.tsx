import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BackgroundWrapperProps {
    children?: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                // Deep space blue to slightly lighter purple/blue
                colors={['#050511', '#0F1123', '#161229']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {/* Optional: Add some ambient glowing orbs here if needed later */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050511', // Fallback
    },
    content: {
        flex: 1,
    }
});

export default BackgroundWrapper;
