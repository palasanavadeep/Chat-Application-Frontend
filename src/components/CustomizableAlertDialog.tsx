import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ICustomizableAlertDialog{
    actionName : string
    onAction : (event: React.MouseEvent<HTMLButtonElement>) => void,
    triggerButtonLabel : string,
    alertDialogTitle: string,
    alertDialogDescription: string,
    className : string
}

export default function CustomizableAlertDialog(props : ICustomizableAlertDialog) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={props.className}>{props.triggerButtonLabel}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.alertDialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{props.alertDialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={props.onAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
