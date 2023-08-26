import _ from "lodash";
import { useState, useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { canUseTouchScreen } from "../libs/DeviceCapabilities";

export default function useInitialDimensions() {
    const { height } = useWindowDimensions();
    const [initialHeight, setInitialHeight] = useState(null);
    const [callbackTriggered, setCallbackTriggered] = useState(false);

    const callbackRef = useRef(null);

    useEffect(() => {
        if (_.isNull(initialHeight)) {
            setInitialHeight(height);
            return;
        }

        if (callbackTriggered && (_.isEqual(height, initialHeight) || !canUseTouchScreen())) {
            if (!callbackRef.current) { return; }
            callbackRef.current()
        }
    }, [height, callbackTriggered]);

    /**
     * 
     * @param {Function} callback 
     */
    const runOnDimensionRestore = (callback) => {
        callbackRef.current = callback;
        setCallbackTriggered(true);
    }

    return { runOnDimensionRestore }
}