import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const usePreviousLocation = () => {
    const location = useLocation();
    const previousLocationRef = useRef(null);

    useEffect(() => {
        previousLocationRef.current = location;
    }, [location]);

    return previousLocationRef.current;
};

