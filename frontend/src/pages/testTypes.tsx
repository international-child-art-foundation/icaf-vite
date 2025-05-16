import type { IUser } from "@icaf/shared";

export const testTypes = () => {
  const aUser: IUser = {
    name: "what",
    id: "123"
  }
  return (
    <div>
      {aUser.name}
    </div>
  )
}