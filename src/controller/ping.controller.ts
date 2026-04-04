import type { Request, Response } from "express";

export const pingHandler = (req: Request, res: Response) : void => {
    // const body: Body = req.body;
    // console.log(body)
    const user_id = req.params.user_id;
    console.log(user_id)
    res.send("PONG");
}