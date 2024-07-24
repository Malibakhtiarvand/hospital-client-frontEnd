import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getCookie } from "./rtkQueryPatients";

const slice = createSlice(
    {
        name: "patient",
        initialState: { departments: [], dataOfUser: {}, doctors: [], times: [], loadDoctors: false, loadTimes: false, msgPending: false, msgFulfilled: false },
        reducers: {
            getDepartments(state, action) {
                state.departments = action.payload
            },
            getDoctors(state, action) {
                state.doctors = action.payload
            },
            changeLoadDoctors(state, action) {
                state.loadDoctors = action.payload
            },
            changeLoadTimes(state, action) {
                state.loadTimes = action.payload
            },
            getTimes(state, action) {
                action.payload.forEach(i => {
                    var time = i.visitTime = i.visitTime.split("T")[0].split("-")
                    time[0] = parseInt(time[0])
                    time[1] = parseInt(time[1])
                    time[2] = parseInt(time[2])
                    i.visitTime = farvardin.gregorianToSolar(i.visitTime[0], i.visitTime[1], i.visitTime[2], "string")
                })
                state.times = action.payload
            },
            updateTimes(state, action) {
                state.times.push(action.payload)
            }
        },
        extraReducers: builder => {
            builder.addCase(addMessageContactUs.pending, (state, _) => {
                state.msgPending = true
            })

            builder.addCase(addMessageContactUs.fulfilled, (state, action) => {
                if (action.payload.msgData) {
                    state.msgFulfilled = true
                    state.msgPending = false
                    var newCookie = JSON.stringify(action.payload.data)
                    var encode = window.btoa(unescape(encodeURIComponent(newCookie)))
                    document.cookie = `contact=${encode}; expires=${new Date(new Date().getTime() + (10 * 24 * 60 * 60 * 1000)).toUTCString()}; path=/`;
                }
            })
        }
    }
)

export const { getDepartments, getDoctors, changeLoadDoctors, changeLoadTimes, getTimes, updateTimes } = slice.actions
export const sliceReducer = slice.reducer

export const getDepartmentsF = () => async (dispatch) => {
    const { data: DepartmentsData } = await axios.get("https://localhost:7087/Auth/allInfo")
    return dispatch(getDepartments(DepartmentsData))
}

export const addMessageContactUs = createAsyncThunk("/patient/msg", async (data) => {
    const { data: msgData } = await axios.post("https://localhost:7087/api/ContactUs", data)
    return { msgData, data }
})
