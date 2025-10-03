import React from 'react'
import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

const ProfileComp = ({ user }:any) => {
  return (
      <div className="w-full space-y-6">
          <div>
              <h3 className="text-lg  font-medium">Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                  Here is the information associated with your account.
              </p>
          </div>
          <Card className=" p-5">
              <div className="flex justify-between">
                  <p className="text-muted-foreground">Name</p>
                  <p>{user.name}</p>
              </div>
              <Separator />
              <div className="flex justify-between">
                  <p className="text-muted-foreground">Email</p>
                  <p>{user.email}</p>
              </div>
              <Separator />
              <div className="flex justify-between">
                  <p className="text-muted-foreground">User ID</p>
                  <p>{user.user_id}</p>
              </div>
              <Separator />
              <div className="flex justify-between">
                  <p className="text-muted-foreground">Client ID</p>
                  <p>{user.client_id}</p>
              </div>
          </Card>
          <div className="flex justify-end">
              <LogoutButton />
          </div>
      </div>
  )
}

export default ProfileComp