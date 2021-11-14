import { FaGithub } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import NextLink from "next/link";
import React from "react";

export default function HomeNavBar ({ children }: { children: React.ReactNode }) {
    return (
        <section className="w-full px-6 pb-12 antialiased bg-white">
            <div className="mx-auto max-w-7xl">
                <nav className="relative z-50 h-24 select-none">
                    <div className="container relative flex flex-wrap items-center justify-between h-24 mx-auto overflow-hidden font-medium border-b border-gray-200 md:overflow-visible lg:justify-center sm:px-4 md:px-2">
                        <div className="flex items-center justify-start w-1/4 h-full pr-4">
                            <a href="#_" className="inline-block py-4 md:py-0">
                                <span className="p-1 text-xl font-black leading-none text-gray-900">
                                    pronote
                                </span>
                            </a>
                        </div>
                        <div className="top-0 left-0 items-start w-full h-full p-4 text-sm bg-gray-900 bg-opacity-50 md:items-center md:w-3/4 md:absolute lg:text-base md:bg-transparent md:p-0 md:flex hidden">
                            <div className="flex-col w-full h-auto overflow-hidden bg-white rounded-lg md:bg-transparent md:overflow-visible md:rounded-none md:relative md:flex md:flex-row">
                                <a href="#_" className="items-center block w-auto h-16 px-6 text-xl font-black leading-none text-gray-900 md:hidden">pronote-evolution<span className="text-green-600">.</span></a>
                                <div className="flex flex-col items-start justify-center w-full space-x-6 text-center lg:space-x-8 md:w-2/3 md:mt-0 md:flex-row md:items-center">
                                    <NextLink href="/">
                                        <a className="inline-block w-full py-2 mx-0 ml-6 font-medium text-left text-green-600 md:ml-0 md:w-auto md:px-0 md:mx-2 lg:mx-3 md:text-center">Comptes</a>
                                    </NextLink>
                                    <NextLink href="/features">
                                        <a className="inline-block w-full py-2 mx-0 font-medium text-left text-gray-700 md:w-auto md:px-0 md:mx-2 hover:text-green-600 lg:mx-3 md:text-center">Fonctionnalités</a>
                                    </NextLink>
                                </div>
                                <div className="flex flex-col items-start justify-end w-full pt-4 md:items-center md:w-1/3 md:flex-row md:py-0">
                                    <a
                                        href="https://github.com/Vexcited/pronote-evolution"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center w-full text-lg font-medium leading-4 text-white bg-green-600 md:w-auto md:rounded-full hover:bg-green-500 focus:outline-none md:focus:ring-2 focus:ring-0 focus:ring-offset-2 focus:ring-green-600"
                                    >
                                        <FaGithub />
                                    </a>
                                    
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-0 flex flex-col items-center items-end justify-center w-10 h-10 bg-white rounded-full cursor-pointer md:hidden hover:bg-gray-100">
                            <HiMenu className="w-6 h-6 text-gray-700" />
{/*                             
                            <svg class="w-6 h-6 text-gray-700" x-show="showMenu" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: none;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg> */}
                        </div>
                    </div>
                </nav>

                <div className="container max-w-lg px-4 py-32 mx-auto text-left md:max-w-none md:text-center">
            {children}
        </div>

        </div>
        </section>
    )
}