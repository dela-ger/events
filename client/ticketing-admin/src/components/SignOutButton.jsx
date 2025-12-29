import React from "react";
import { signOut } from "../utils/auth";

export default function SignOutButton() {
    return (
        <button 
          onClick={signOut}
          style={
            {
                backgroundColor: '#e74c3c',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'

            }
          }
          >
            Sign Out
        </button>
    )
}