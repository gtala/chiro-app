import React from "react"

export const Layout = ({ children }: any) => {
    return (
        
        <div style={{ padding: 20, backgroundColor: "#eee", flex: 1, minHeight: "100vh", minWidth: "100%" }}>
            {children}
        </div>
    );
}

export default Layout;