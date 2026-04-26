import type { Request, Response, NextFunction } from 'express';
export declare const isDoctor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const isRootAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=role.middleware.d.ts.map