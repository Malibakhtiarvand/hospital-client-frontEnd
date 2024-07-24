import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi(
    {
        baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:7087/Auth" }),
        endpoints: builder => ({
            addPatient: builder.mutation(
                {
                    query: data => (
                        {
                            url: "",
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                    )
                }
            ),
            cancelVisit: builder.query(
                {
                    query: () => (
                        {
                            url: "/CancelVisit",
                            headers: {
                                'Authorization': `Bearer ${getCookie("token")}`
                            }
                        }
                    )
                }
            ),
            getData: builder.query(
                {
                    query: () => (
                        {
                            url: "/dataOfUser",
                            headers: {
                                'Authorization': `Bearer ${getCookie("token")}`
                            },
                            method: "GET"
                        }
                    )
                }
            )
        })
    }
)

export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export const { useAddPatientMutation, useLazyCancelVisitQuery, useGetDataQuery } = api
export default api
