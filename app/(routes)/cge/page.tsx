import StaticBanner from "@/components/shared/staticBanner"

const page = () => {
  return (
      <div className="h-screen flex justify-center items-center">
          <StaticBanner title="Content Generation Engine" badge={'CGE Audits'} />
      </div>
  )
}

export default page