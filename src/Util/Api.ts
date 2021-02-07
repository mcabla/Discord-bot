import fetch from "node-fetch";

export class API{
    public static get<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json() as Promise<T>
            });
    }

    public static patch<T>(url: string, params: string): Promise<T> {
        return fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'},
            method: 'PATCH',
            body: params
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json() as Promise<T>
        });
    }

}