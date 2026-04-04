import express, {Router} from "express";
import type {Request, Response} from "express"

const loginController: Router = express.Router();
loginController.get('/', (req: Request, res: Response) => {
    res.send("login Page")
})

export {loginController};
