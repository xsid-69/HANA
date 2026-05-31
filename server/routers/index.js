import { router } from '../trpc'
import { companionRouter } from './companion'
import { bookingRouter } from './booking'
import { messageRouter } from './message'
import { reviewRouter } from './review'
import { userRouter } from './user'

export const appRouter = router({
  companion: companionRouter,
  booking: bookingRouter,
  message: messageRouter,
  review: reviewRouter,
  user: userRouter,
})
