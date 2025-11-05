import StaticBanner from "@/components/static/shared/StaticBanner"

const page = () => {
  return (
      <div className="h-screen flex justify-center items-center">
          <StaticBanner title="Content Generation Engine" badge={'CGE Audits'} />
      </div>
  )
}

export default page