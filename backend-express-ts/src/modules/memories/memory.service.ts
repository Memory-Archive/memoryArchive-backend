import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { CollectionMember, CollectionMemory, Memory, Place, Tag } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { NotImplementedException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { ListMemoriesQuery } from "./memory.validation";

/**
 * PRIVACY / WHO CAN SEE A MEMORY
 *
 * Visibility has exactly two levels. There is NO public option, ever:
 *   - "private": only the owner can see it.
 *   - "friends": the owner and the owner's friends can see it.
 * No public feed, no browsing strangers' memories, no "everyone" setting.
 *
 * A user can READ a memory if ANY of these is true:
 *   1. they own it (memories.user_id), or
 *   2. visibility = "friends" and they are friends with the owner, or
 *   3. it is in a collection they own or are a member of (explicit sharing).
 * Only the owner can EDIT, DELETE, change visibility, or set tags.
 * Soft-deleted memories (deleted_at IS NOT NULL) are invisible to everyone.
 *
 * Write this check ONCE (e.g. canReadMemory(userId, memoryId)) and reuse it in
 * media, comments, reactions and favourites. If the check fails, return 404,
 * not 403, so nobody can tell that a private memory exists.
 *
 * DB is ready: `memories.visibility` ('private' | 'friends', default 'private',
 * enum MEMORY_VISIBILITIES) and the `friendships` table (see friendship.model.ts).
 * Friends of X = friendships with status 'accepted' where X is requester or addressee.
 * Still TODO: the `friends` module (API) itself.
 *
 * FAVOURITE MEMORIES (decided, DB column exists): `memories.is_favourite`
 * (entity field `isFavourite`, default false). A user can only favourite their
 * OWN memories. Friends and collection members can never star someone else's
 * memory, and must never see the owner's isFavourite value (owner-only field,
 * like tags).
 */
class MemoryService {
  private readonly memoryModel = new DBService(Memory);
  private readonly placeModel = new DBService(Place);
  private readonly tagModel = new DBService(Tag);
  private readonly collectionMemoryModel = new DBService(CollectionMemory);
  private readonly collectionMemberModel = new DBService(CollectionMember);

  // GET /memories  - current user's OWN memories with filters + pagination.
  // Filters to add: ?favourite=true (is_favourite = 1), ?visibility=private|friends.
  // Always add deleted_at IS NULL.
  // Full-text: MATCH(title, description) AGAINST (:q IN NATURAL LANGUAGE MODE) via query builder.
  list = async (req: Request, res: Response): Promise<Response> => {
    const userId = currentUserId(req);
    const { page, limit, from, to, placeId, tagId, q, sort } = req.query as unknown as ListMemoriesQuery;

    // Query builders skip soft-deleted rows (deleted_at IS NULL) by default.
    const qb = this.memoryModel.repo
      .createQueryBuilder("m")
      .leftJoinAndSelect("m.place", "place")
      .where("m.userId = :userId", { userId });

    if (from) qb.andWhere("m.memoryDate >= :from", { from });
    if (to) qb.andWhere("m.memoryDate <= :to", { to });
    if (placeId) qb.andWhere("m.placeId = :placeId", { placeId });
    // EXISTS rather than a JOIN, so a memory never appears twice and the page count stays right.
    if (tagId) {
      qb.andWhere("EXISTS (SELECT 1 FROM memory_tags mt WHERE mt.memory_id = m.id AND mt.tag_id = :tagId)", { tagId });
    }
    // Uses the memories_search_idx FULLTEXT index.
    if (q) qb.andWhere("MATCH(m.title, m.description) AGAINST (:q IN NATURAL LANGUAGE MODE)", { q });

    // Timeline order. id is the final tie-breaker so pages never overlap or skip rows.
    // In MySQL, NULLs sort last under DESC and first under ASC, so memories without a time
    // come after timed ones on the same day when newest-first.
    const dir = sort === "oldest" ? "ASC" : "DESC";
    qb.orderBy("m.memoryDate", dir)
      .addOrderBy("m.memoryTime", dir)
      .addOrderBy("m.createdAt", dir)
      .addOrderBy("m.id", dir);

    // offset/limit (plain SQL LIMIT) is safe because the only join is many-to-one,
    // so it can't multiply rows.
    const [items, total] = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    // Tags are many-to-many, so they're loaded for the whole page in one extra query
    // instead of being joined above (which would break the LIMIT).
    const tagsByMemory = new Map<string, Tag[]>();
    if (items.length) {
      const tags = await this.tagModel.repo
        .createQueryBuilder("t")
        .innerJoin("t.memories", "tm")
        .addSelect("tm.id")
        .where("tm.id IN (:...ids)", { ids: items.map((m) => m.id) })
        .orderBy("t.name", "ASC")
        .getMany();
      for (const { memories, ...tag } of tags) {
        for (const { id } of memories) {
          const list = tagsByMemory.get(id) ?? [];
          list.push(tag as Tag);
          tagsByMemory.set(id, list);
        }
      }
    }

    return successResponse(res, {
      data: {
        items: items.map((m) => ({ ...m, tags: tagsByMemory.get(m.id) ?? [] })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  };

  // POST /memories  - validate placeId exists and tagIds belong to the user; create in a transaction.
  // Once the column exists: accept `visibility` ('private' | 'friends'), default 'private'.
  // Reject any other value, including 'public'.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /memories/:memoryId  - with place, tags, cover/media.
  // Uses the read rule above (owner / friend + 'friends' / collection member); 404 otherwise.
  // Tags are the owner's private labels: only include them when the viewer is the owner.
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /memories/:memoryId  (owner only) - can also change `visibility` and `isFavourite`.
  // MySQL 5.7 ignores CHECK constraints, so the validator is the ONLY thing stopping a bad
  // visibility value: use z.enum(MEMORY_VISIBILITIES) from common/enums.ts.
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /memories/:memoryId  - soft delete (owner only).
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PUT /memories/:memoryId/tags  - replace the memory's tag set (tags must belong to the user).
  setTags = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // ---------------------------------------------------------------------------
  // PLANNED ENDPOINTS (not routed yet; DB is ready, need the friends module first)
  //
  // GET /memories/feed           - memories from the user's friends where
  //                                visibility = 'friends', newest first, paginated.
  // GET /users/:userId/memories  - one friend's 'friends' memories. 404 if not friends
  //                                (lives in the users module, uses the same read rule).
  // GET /memories/on-this-day    - the user's own memories with the same month/day in
  //                                earlier years (index memories_on_this_day_idx exists).
  // Favourites (owner only; 404 if the memory isn't yours or is soft-deleted):
  //   POST   /memories/:memoryId/favourite  - set is_favourite = true
  //   DELETE /memories/:memoryId/favourite  - set is_favourite = false
  //   GET    /memories?favourite=true       - filter on the existing list endpoint
  //                                           (no separate /favourites route needed).
  // ---------------------------------------------------------------------------
}

export default new MemoryService();
