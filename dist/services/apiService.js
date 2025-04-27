var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API = '/api/medias';
export function fetchMedias() {
    return __awaiter(this, void 0, void 0, function* () {
        const r = yield fetch(API);
        return r.json();
    });
}
export function addMedia(item) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = yield fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return r.json();
    });
}
export function addMany(items) {
    return __awaiter(this, void 0, void 0, function* () {
        const r = yield fetch(API + '/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        });
        return r.json();
    });
}
export function deleteMedia(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`/api/medias/${id}`, { method: 'DELETE' });
    });
}
