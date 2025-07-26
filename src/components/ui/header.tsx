import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, GraduationCap, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react';
import { DropdownMenu , DropdownMenuTrigger , DropdownMenuSeparator , DropdownMenuLabel , DropdownMenuContent , DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { checkUser } from '@/lib/checkUser'; 
// import { Link } from 'lucide-react';

const header = async() => {
    await checkUser();
  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href='/'>
                <Image  src="/logo.png" alt="SensAI Logo" 
                width = {200} height={60}
                className='h-12 py-1 w-auto object-contain'
                />
            </Link>

            <div className="flex items-center space-x-2 md:space-x-4">
                <SignedIn>
                    <Link href='/dashboard'>
                        <Button>
                            <LayoutDashboard className='h-4 w-4 mr-2' />
                            <span className='hidden md:block'>
                                Industry Insights
                            </span>
                        </Button>
                    </Link>
                

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                            <StarsIcon className='h-4 w-4 ' />
                            <span className='hidden md:block'>
                                Growth Tools
                            </span>
                            <ChevronDown className='h-4 w-4 ' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border border-border rounded-md shadow-md p-2 w-3/4 min-w-[180px] min-w-max">
                    <DropdownMenuItem className="px-4 py-2 hover:bg-muted rounded transition-colors flex items-center gap-2">
                        <Link href={"/resume"} className='flex items-center gap-2 w-full'>
                            <FileText className='h-4 w-4 '/>
                            <span>Build Resume</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-2 hover:bg-muted rounded transition-colors flex items-center gap-2">
                        <Link href={"/ai-cover-letter"} className='flex items-center gap-2 w-full'>
                            <PenBox className='h-4 w-4 '/>
                            <span>Cover Letter</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="px-4 py-2 hover:bg-muted rounded transition-colors flex items-center gap-2">
                        <Link href={"/interview"} className='flex items-center gap-2 w-full'>
                            <GraduationCap className='h-4 w-4 '/>
                            <span>Interview Prep</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                </SignedIn>

                <SignedOut>
                    <div className="flex items-center gap-2">
                        <SignInButton>
                            <Button variant="ghost">Sign In</Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button>Sign Up</Button>
                        </SignUpButton>
                    </div>
                </SignedOut>

                <SignedIn>
                    <UserButton afterSignOutUrl="/" 
                    appearance={{
                        elements:{
                            avatarBox : "w-10 h-10",
                            userButtonPopoverCard : "shadow-xl",
                            userPreviewMainIdentifier : "font-semibold",
                        },
                    }}
                    />
                </SignedIn>


                
            </div>
        </nav>
    </header>
  )
}

export default header