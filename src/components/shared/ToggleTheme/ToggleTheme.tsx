"use client"

import { useEffect, useState } from "react";
import { MdOutlineLightMode } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";

const ToggleTheme = () => {

    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        const theme = localStorage.getItem("theme")
        if (theme === "dark") (setDarkMode(false))
    }, [])

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem("theme", "dark")
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem("theme", "light")
        }
    }, [darkMode])

    return (
        <div>
            <button
                onClick={() => setDarkMode(!darkMode)}
            >
                {darkMode ? <MdOutlineLightMode></MdOutlineLightMode> : <MdOutlineDarkMode></MdOutlineDarkMode>}
            </button>
        </div>
    );
};

export default ToggleTheme;