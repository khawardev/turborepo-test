'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContainerLg } from '../shared/containers'
import { Blur, BlurDelay, BlurDelay2 } from '../shared/blur'
import LaserFlow from '../ui/react-bits/LaserFLow/LaserFlow'

export default function HeroSection() {
    return (
        <ContainerLg>
            <div>
                <Blur
                    className="max-w-2xl text-balance tracking-tighter text-5xl font-medium md:text-6xl ">
                    Brand Control Returns to your Team
                </Blur>
                <BlurDelay className="mt-8 max-w-2xl text-pretty font-medium text-muted-foreground md:text-xl text-lg">
                    Humanbrand AI is the Brand OS that puts brand control back in your team's hands, enabling instant clarity, secure governance, and the freedom to create on-brand content at scale
                </BlurDelay>

                <BlurDelay2 className="mt-12 flex items-center gap-2">
                    <Button asChild size={'lg'}>
                        <Link href="/brands">
                            Get Started
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size={'lg'}>
                        <Link href="#link">
                            <span className="text-nowrap">Request a demo</span>
                        </Link>
                    </Button>
                </BlurDelay2>
            </div>
            <LaserFlow
                horizontalBeamOffset={0.1}
                verticalBeamOffset={0}
            />
        </ContainerLg>
    )
}



{/* <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">Modern Software testing reimagined</h1>
                <p className="text-muted-foreground mx-auto my-8 max-w-2xl text-xl">Officiis laudantium excepturi ducimus rerum dignissimos, and tempora nam vitae, excepturi ducimus iste provident dolores.</p>

                <Button
                    asChild
                    size="lg">
                    <Link href="#">
                        <span className="btn-label">Get Started</span>
                    </Link>
                </Button>
            </div>

            <div className="perspective-distant pl-8 ">
                <div className=" rotate-x-20 mask-b-from-55% mask-b-to-100% mask-r-from-75% skew-x-12 pl-6 pt-6">
                    <Image
                        className="rounded-(--radius) border shadow-xl dark:hidden"
                        src="https://i.postimg.cc/qvwFkY15/screencapture-localhost-3000-dashboard-brand-a8254481-ac10-45a3-845c-4650679ac0c3-2025-10-21-17-28-0.png"
                        alt="Tailark hero section"
                        width={2880}
                        height={2074}
                    />
                    <Image
                        className="rounded-(--radius) hidden border shadow-xl dark:block"
                        src="https://i.postimg.cc/c1fXx2HC/screencapture-localhost-3000-dashboard-brand-a8254481-ac10-45a3-845c-4650679ac0c3-2025-10-21-17-27-5.png"
                        alt="Tailark hero section"
                        width={2880}
                        height={2074}
                    />
                </div>
            </div> */}