import React from "react";
import { Button } from "@heroui/button";

import { useAuth } from "@/context/AuthContext";

export default function ProfileSetting() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col ">
      <h2 className="mb-4 text-lg font-semibold border-divider border-b">
        การตั้งค่าบัญชี
      </h2>

      <div className="flex flex-row items-center justify-between mt-2">
        <div className="flex flex-row gap-2">
          <div>X</div>
          <div>X</div>
        </div>
        <div>ss</div>
      </div>

      <div className="mt-8 border-t border-divider pt-6">
        <Button
          className="w-full"
          color="danger"
          variant="flat"
          onClick={logout}
        >
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
