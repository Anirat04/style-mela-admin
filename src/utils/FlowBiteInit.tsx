"use client"
import { initFlowbite } from 'flowbite';
import React, { useEffect } from 'react';

const FlowBiteInit = () => {
    useEffect(() => {
        initFlowbite();
    }, []);
    return null
};

export default FlowBiteInit;