// navigation.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"


let routerRef:AppRouterInstance | null ;

export const setRouter = (router: AppRouterInstance | null) => {
  routerRef = router;
};

export const navigate = (path: string) => {
  if (routerRef) {
    routerRef.push(path);
  } else if (typeof window !== "undefined") {
    console.log("hard navigate")
    // window.location.href = path;
  }
};
