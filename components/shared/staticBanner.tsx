import { Blur, BlurDelay } from "./blur"
import { Badge } from "../ui/badge"

const StaticBanner = ({ title, badge }: { title: string, badge: string }) => {
    return (
        <div className="relative select-none py-14">
            <section className=' text-center flex-col space-y-4 '>
                <Blur>
                    <Badge>{badge}</Badge>
                </Blur>
                <BlurDelay>
                    <h1 className=" text-5xl font-medium text-center w-full capitalize ">{title}</h1>
                </BlurDelay>
            </section>
        </div>
    )
}
export default StaticBanner