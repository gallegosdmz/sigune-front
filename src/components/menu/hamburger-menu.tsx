"use client"

import type React from "react"

interface HamburgerMenuProps {
  isOpen: boolean
  toggle: () => void
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="flex flex-col justify-center items-center w-10 h-10 rounded-md focus:outline-none"
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
    >
      <span
        className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ease-out ${
          isOpen ? "rotate-45 translate-y-1.5" : "mb-1.5"
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ease-out ${
          isOpen ? "opacity-0" : "mb-1.5"
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ease-out ${
          isOpen ? "-rotate-45 -translate-y-1.5" : ""
        }`}
      />
    </button>
  )
}
