import Image from 'next/image';
import LaserFlow from './LaserFlow';
import { ContainerLg } from '@/components/shared/containers';

export function LaserSection() {
    return (
        <div>
            <LaserFlow
                horizontalBeamOffset={0.1}
                verticalBeamOffset={0}
            />
            {/* <div className="md:px-0 px-4 mx-auto max-w-6xl absolute top-1/2 left-1/2 -translate-x-1/2 w-full rounded-[20px] z-[6]">
                <div className="mask-b-from-5%">
                    <div className="inset-shadow-2xs border ring-background dark:inset-shadow-border/20 bg-border relative mx-auto overflow-hidden rounded-2xl  p-1 shadow-lg shadow-zinc-950/15 ">
                        <Image
                            className=" h-110 w-full relative hidden rounded-xl dark:block object-cover object-top"
                            src="https://i.postimg.cc/c1fXx2HC/screencapture-localhost-3000-dashboard-brand-a8254481-ac10-45a3-845c-4650679ac0c3-2025-10-21-17-27-5.png"
                            alt="Tailark hero section"
                            width={2074}
                            height={2074}
                        />
                        <Image
                            className="z-2 h-110 w-full  relative rounded-xl  dark:hidden object-cover object-top"
                            src="https://i.postimg.cc/qvwFkY15/screencapture-localhost-3000-dashboard-brand-a8254481-ac10-45a3-845c-4650679ac0c3-2025-10-21-17-28-0.png"
                            alt="Tailark hero section"
                            width={1440}
                            height={2074}
                        />
                    </div>
                </div>
            </div> */}

          
        </div>
    );
}