import { Request, Response, NextFunction } from 'express';

export const stateAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const planType = (req as any).planType;
  const allowedStateIds = (req as any).allowedStateIds || [];

  // PRO and UNLIMITED have access to everything
  if (planType === 'PRO' || planType === 'UNLIMITED') {
    return next();
  }

  // For other tiers, check if the requested state is in their allowed list
  // The stateId would typically be in the query params or body
  const requestedStateId = req.query.stateId || req.body.stateId || req.params.stateId;

  if (requestedStateId && !allowedStateIds.includes(requestedStateId)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: `Your current plan (${planType}) does not have access to this state.`
    });
  }

  next();
};
