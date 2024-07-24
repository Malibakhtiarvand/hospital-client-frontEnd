import { configureStore } from "@reduxjs/toolkit";
import { getDepartmentsF, sliceReducer } from "./slices/patientSlice";
import api from "./slices/rtkQueryPatients";

export const store = configureStore(
    {
        reducer: {
            sliceReducer,
            [api.reducerPath]:api.reducer
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
    }
)

store.dispatch(getDepartmentsF())
