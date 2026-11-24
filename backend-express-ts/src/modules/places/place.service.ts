import type { Request, Response } from "express";
import type { SelectQueryBuilder } from "typeorm";
import { DBService } from "../../DB/db.service";
import { Place } from "../../DB/models";
import { NotFoundException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { CreatePlaceDTO, SearchPlacesQuery } from "./place.validation";

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111.045;

class PlaceService {
  private readonly placeModel = new DBService(Place);

  // GET /places
  // Paginated list of places. Optional name filter (q) and optional radius filter
  // (lat + lng + radiusKm). With coordinates, results are nearest first and each
  // item gets `distanceKm`; without them, newest first.
  search = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit, q, lat, lng, radiusKm } = req.query as unknown as SearchPlacesQuery;

    const query = this.placeModel.repo.createQueryBuilder("place");

    // Escape % and _ so they are matched literally, not as LIKE wildcards.
    if (q) {
      query.andWhere("place.name LIKE :name", { name: `%${this.escapeLike(q)}%` });
    }

    const isNearbySearch = lat !== undefined && lng !== undefined;
    if (isNearbySearch) {
      this.filterByRadius(query, lat, lng, radiusKm);
    } else {
      query.orderBy("place.createdAt", "DESC").addOrderBy("place.id", "ASC");
    }

    const total = await query.getCount();
    query.offset((page - 1) * limit).limit(limit);

    let items: (Place & { distanceKm?: number })[];
    if (isNearbySearch) {
      // No joins, so each raw row lines up with the entity at the same index.
      const { entities, raw } = await query.getRawAndEntities();
      items = entities.map((place, i) => ({
        ...place,
        distanceKm: Math.round(Number(raw[i].distance_km) * 1000) / 1000,
      }));
    } else {
      items = await query.getMany();
    }

    return successResponse(res, {
      data: { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  };

  // POST /places
  // Find-or-create: if a place with the same provider + providerPlaceId already exists,
  // return it with 200; otherwise insert it and return 201.
  create = async (req: Request, res: Response): Promise<Response> => {
    const { name, address, latitude, longitude, provider, providerPlaceId } = req.body as CreatePlaceDTO;
    const alreadyExists = (place: Place) =>
      successResponse(res, { message: "Place already exists", data: { place } });

    // Places without a provider id (e.g. added by hand) are never deduplicated.
    const providerKey = provider && providerPlaceId ? { provider, providerPlaceId } : null;

    if (providerKey) {
      const existing = await this.placeModel.findOneBy(providerKey);
      if (existing) return alreadyExists(existing);
    }

    try {
      const place = await this.placeModel.create({
        name,
        address: address ?? null,
        latitude,
        longitude,
        provider: provider ?? null,
        providerPlaceId: providerPlaceId ?? null,
      });
      return successResponse(res, { status: 201, message: "Place created", data: { place } });
    } catch (err) {
      // Two requests for the same place can both pass the check above; the
      // UNIQUE (provider, provider_place_id) index rejects the second insert,
      // so hand back the row the first request created.
      if (providerKey && this.isDuplicateKeyError(err)) {
        const existing = await this.placeModel.findOneBy(providerKey);
        if (existing) return alreadyExists(existing);
      }
      throw err;
    }
  };

  // GET /places/:placeId
  getById = async (req: Request, res: Response): Promise<Response> => {
    const { placeId } = req.params as { placeId: string };

    const place = await this.placeModel.findOneBy({ id: placeId });
    if (!place) {
      throw new NotFoundException("Place not found");
    }

    return successResponse(res, { data: { place } });
  };

  /**
   * Keeps only places within `radiusKm` of (lat, lng), selects the distance as
   * `distance_km` and orders by it, nearest first.
   * A cheap bounding box is applied first so the exact Haversine check runs on fewer rows.
   */
  private filterByRadius = (query: SelectQueryBuilder<Place>, lat: number, lng: number, radiusKm: number) => {
    // Haversine: great-circle distance in km between the search point and each place.
    const distance = `(${EARTH_RADIUS_KM} * 2 * ASIN(SQRT(
      POWER(SIN(RADIANS(place.latitude - :lat) / 2), 2) +
      COS(RADIANS(:lat)) * COS(RADIANS(place.latitude)) *
      POWER(SIN(RADIANS(place.longitude - :lng) / 2), 2)
    )))`;
    query.setParameters({ lat, lng, radiusKm });

    const latDelta = radiusKm / KM_PER_DEGREE_LAT;
    query.andWhere("place.latitude BETWEEN :minLat AND :maxLat", {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
    });

    // Longitude degrees shrink toward the poles; skip the longitude box near a pole
    // or when it would wrap around ±180°, and let the exact check handle it.
    const cosLat = Math.cos((lat * Math.PI) / 180);
    if (cosLat > 0.01) {
      const lngDelta = radiusKm / (KM_PER_DEGREE_LAT * cosLat);
      if (lng - lngDelta >= -180 && lng + lngDelta <= 180) {
        query.andWhere("place.longitude BETWEEN :minLng AND :maxLng", {
          minLng: lng - lngDelta,
          maxLng: lng + lngDelta,
        });
      }
    }

    query
      .andWhere(`${distance} <= :radiusKm`)
      .addSelect(distance, "distance_km")
      .orderBy("distance_km", "ASC")
      .addOrderBy("place.id", "ASC");
  };

  /** Escapes LIKE wildcards (MySQL's default escape character is `\`). */
  private escapeLike = (value: string): string => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

  /** MySQL duplicate-key error, as surfaced by TypeORM's QueryFailedError (mysql2 driver). */
  private isDuplicateKeyError = (err: any): boolean =>
    err?.code === "ER_DUP_ENTRY" || err?.driverError?.code === "ER_DUP_ENTRY";
}

export default new PlaceService();
