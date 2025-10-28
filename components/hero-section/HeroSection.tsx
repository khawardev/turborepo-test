'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContainerLg } from '../shared/containers'
import { Blur, BlurDelay, BlurDelay2 } from '../shared/MagicBlur'
import LaserFlow from '../ui/react-bits/LaserFLow/LaserFlow'
export default function HeroSection() {
    return (
        <ContainerLg>
            <div>
                <Blur
                    className="max-w-2xl text-balance tracking-tighter text-5xl font-medium md:text-6xl ">
                    Brand Control Returns to your Team
                </Blur>
                <BlurDelay className="mt-8 max-w-2xl text-pretty text-muted-foreground md:text-xl text-lg">
                    Humanbrand AI is the Brand OS that puts brand control back in your team's hands, enabling instant clarity, secure governance, and the freedom to create on-brand content at scale
                </BlurDelay>
                <BlurDelay2 className="mt-12 flex items-center gap-2">
                    <Button asChild size={'lg'}>
                        <Link href="/brands">
                            Get Started
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


