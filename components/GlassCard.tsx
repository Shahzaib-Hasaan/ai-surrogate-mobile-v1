import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string; // nativewind support
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style, className, ...props }) => {
    return (
        <View
            className={`bg-surrogate-glass border border-glass-border rounded-2xl overflow-hidden mb-4 ${className || ''}`}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
};

export default GlassCard;
