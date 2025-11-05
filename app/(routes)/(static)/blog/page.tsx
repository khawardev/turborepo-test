import BlogPostCard from '@/components/static/blogs/BlogPostCard'
import { posts } from '@/components/static/blogs/blog'
import { ContainerLg } from '@/components/static/shared/Containers'
import React from 'react'

const page = () => {
  return (
      <ContainerLg>
          <div className="text-start mb-10">
              <h1 className="text-2xl font-bold tracking-tight sm:text-6xl">
                  Where <span className="relative isolate inline-block">builders think</span> out loud
              </h1>
              <p className="mt-3 text-lg leading-8 text-muted-foreground">
                  Thoughts on building, designing, and shipping. Sometimes technical, always useful.
              </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: any) => (
                  <BlogPostCard key={post.id} post={post} />
              ))}
          </div>
      </ContainerLg>
  )
}

export default page