import { IsEmail, MinLength, IsString } from 'class-validator';

export class RegisterUserDto {

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    lastname: string;
    
    @MinLength(6)
    password: string;

    @IsString()
    phone: string;

    @IsString()
    nacionality: string;



}