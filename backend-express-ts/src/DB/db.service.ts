import type {
  DeepPartial,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { AppDataSource } from "./DBconnection";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Thin generic wrapper around a TypeORM repository with the operations most
 * services need. Use `.repo` for anything more advanced (query builders, etc.).
 */
export class DBService<T extends ObjectLiteral> {
  constructor(private readonly target: EntityTarget<T>) {}

  // Resolved lazily so services can be constructed before the DataSource initialises.
  get repo(): Repository<T> {
    return AppDataSource.getRepository(this.target);
  }

  find(options: FindManyOptions<T> = {}): Promise<T[]> {
    return this.repo.find(options);
  }

  findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne(options);
  }

  findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
    return this.repo.findOneBy(where);
  }

  async paginate(
    options: FindManyOptions<T> = {},
    { page = 1, limit = 20 }: PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const [items, total] = await this.repo.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  exists(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<boolean> {
    return this.repo.existsBy(where);
  }

  count(where?: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<number> {
    return this.repo.countBy(where ?? {});
  }

  create(data: DeepPartial<T>): Promise<T> {
    return this.repo.save(this.repo.create(data));
  }

  createMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.repo.save(this.repo.create(data));
  }

  /** Updates matching rows and returns the number affected. */
  async update(where: FindOptionsWhere<T>, data: Parameters<Repository<T>["update"]>[1]): Promise<number> {
    const result = await this.repo.update(where, data);
    return result.affected ?? 0;
  }

  /** Sets deleted_at (only for entities with a @DeleteDateColumn). */
  async softDelete(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repo.softDelete(where);
    return result.affected ?? 0;
  }

  async restore(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repo.restore(where);
    return result.affected ?? 0;
  }

  /** Permanently removes rows. */
  async delete(where: FindOptionsWhere<T>): Promise<number> {
    const result = await this.repo.delete(where);
    return result.affected ?? 0;
  }
}
