import { Router } from 'express';

export interface IRouter{
    basePath: string;
    authenticate: boolean;
    getRouter(): Router;
}