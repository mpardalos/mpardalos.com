import { dbg } from "./lib/utils";

export default async (req, context) => {
    console.log("deploy-failed");
    console.log(await req.json());
}
