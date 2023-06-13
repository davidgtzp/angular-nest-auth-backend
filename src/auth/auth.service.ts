import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcryptjs from "bcryptjs";

import { CreateUserDto, UpdateAuthDto, LoginDto, RegisterUserDto } from './dto';

import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';


@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,
    private jwtService: JwtService,

  ) {}


  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      const { password, ...userData} = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10),
        ...userData
      });
      
      //const newUser = new this.userModel( createUserDto );
      await newUser.save();
      
      const { password:_, ...user } = newUser.toJSON();
      return user;

    } catch (error) {
        if (error.code === 11000) {
          throw new BadRequestException(`${ createUserDto.email } alredy exists!`);
        }
        throw new InternalServerErrorException(`Error: ${ error.code }`);
    }

  }

  async register( registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const { email, name, password, ...userData} = registerUserDto;
    // const cUsrDto = new CreateUserDto(); 
    // cUsrDto.email = email;
    // cUsrDto.name = name;
    // cUsrDto.password = password;
    const user = await this.create({ email: registerUserDto.email, name: registerUserDto.name, password: registerUserDto.password});
    
    // const loginDto = new LoginDto();
    // loginDto.email = email;
    // loginDto.password = password;
    //return this.login({ email: registerUserDto.email, password: registerUserDto.password });

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login( loginDto: LoginDto): Promise<LoginResponse> {

    const { email, password} = loginDto;

    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password:_, ...resto } = user.toJSON();

    return {
      user: resto,
      token: this.getJwtToken( { id: user.id })
    }

}

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }
  
  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );
    const { password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken( payload: JwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;
  }

}
