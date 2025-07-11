import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Provider } from "../schemas/provider.schema";
import { EProvider, IListResponse } from "@ploutos/common";
import { ProviderDto, UpdateProviderDto } from "../dto/provider.dto";

@Injectable()
export class ProviderService {
    constructor(
        @InjectModel(Provider.name)
        private providerModel: Model<Provider>,
    ) {}

    async list() {
        return await this.providerModel.find().exec();
    }

    async find(provider: EProvider) {
        return this.providerModel.findOne({ provider: provider }).exec();
    }

    async getById(id: string) {
        return this.providerModel.findById(id).exec();
    }

    async create(provider: ProviderDto) {
        return new this.providerModel(provider).save();
    }

    async update(data: UpdateProviderDto) {
        return this.providerModel
            .updateOne(
                { _id: data._id },
                {
                    provider: data.provider,
                    displayName: data.displayName,
                    isActive: data.isActive,
                },
                { upsert: true, new: true },
            )
            .exec();
    }

    async listPagination(
        skip: number,
        take: number,
        search?: string,
    ): Promise<IListResponse<Provider>> {
        let searchQuery: any;

        if (search) {
            searchQuery = search
                ? {
                    $or: [
                        { displayName: { $regex: search, $options: 'i' } }, // Case-insensitive search for displayName
                    ],
                }
                : {};
        }

        const list = await this.providerModel
            .find(searchQuery)
            .skip(skip)
            .limit(take)
            .select('-__v')
            .exec();

        const totalItems = await this.providerModel
            .countDocuments(searchQuery)
            .exec();

        return {
            data: list,
            count: totalItems,
        };
    }
}
