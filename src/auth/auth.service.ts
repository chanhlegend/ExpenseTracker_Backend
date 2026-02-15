import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT
        const token = this.generateToken(user);

        return {
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            access_token: token,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Generate JWT
        const token = this.generateToken(user);

        return {
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            access_token: token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.userModel
            .findById(userId)
            .select('-password');
        return { user };
    }

    private generateToken(user: UserDocument): string {
        const payload = { sub: user._id, email: user.email };
        return this.jwtService.sign(payload);
    }
}
