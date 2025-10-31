import React, { useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface ILabledInput {
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function LabledInput(props: ILabledInput) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="flex flex-col gap-1 max-w-lg">
            <Label className="text-sm font-medium text-gray-700">{props.label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type={props.type === 'password' ?(!showPassword ? 'password' : "text"): props.type}
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                />
                {props.type === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-sm text-blue-500 focus:outline-none"
                    >
                        {showPassword ? " Hide" : 'Show'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default LabledInput;
