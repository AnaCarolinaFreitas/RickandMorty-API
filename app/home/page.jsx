"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Home.module.css";
import CharacterCard from "../../components/CharacterCard";
import Loader from "../../components/Loader";

export default function Home() {
    const [search, setSearch] = useState("");
    const [characters, setCharacters] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const cacheRef = useRef(new Map());

    
        const fetchCharacters = async (name="", pageNumber=1) => {
            setLoading(true);
            const cache = cacheRef.current;
            const cacheKey = `${name}_${pageNumber}`;
            const nextPageNumber = pageNumber + 1;
            const nextCacheKey = `${name}_${nextPageNumber}`;

            const cleanCacheIfNeeded = () => {
                while (cache.size >= 5) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                    console.log(`⛔ Página removida do cache: ${firstKey}`);
                }
        };

        console.log("\n============== BUSCA INICIADA ==============");
        console.log(`◀ Cache anterior: ${cache.size} páginas`);

        let total = totalPages;
        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            setCharacters(cached.results);
            setTotalPages(cached.totalPages);
            total = cached.totalPages;
            setNotFound(false);
            setLoading(false);
            console.log(`☑ Cache sendo utilizado: ${cacheKey}`);
        } else {
            try {
                const { data } = await axios.get(`https://rickandmortyapi.com/api/character/?page=${pageNumber}&name=${name}`);

                cleanCacheIfNeeded();
                cache.set(cacheKey, {
                    results: data.results,
                    totalPages: data.info.pages,
                }); // salvar no cache

                setCharacters(data.results);
                setTotalPages(data.info.pages);
                total = data.info.pages;
                setNotFound(false);
                console.log(`💾 Salvo no cache: ${cacheKey}`);
            } catch {
                setCharacters([]);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }

        if (nextPageNumber <= total && !cache.has(nextCacheKey)) {
            try {
                const res = await axios.get(`https://rickandmortyapi.com/api/character/?page=${nextPageNumber}&name=${name}`);
                cleanCacheIfNeeded();
                cache.set(nextCacheKey, {
                    results: res.data.results,
                    totalPages: res.data.info.pages,
                });
                console.log(`💚 Prefetch salvo: ${nextCacheKey}`);
            } catch (err) {
                console.log(`💔 Prefetch falhou: ${nextCacheKey}`, err);
            }
        } else {
            console.log("💥 Prefetch ignorado: já no cache ou fora do limite");
        }

        console.log(`🎁 Cache final: ${cache.size} páginas`);
        for (const [key, val] of cache.entries()) {
            console.log(`🎁 ${key}: ${val.results.length} personagens`);
        }
        console.log("============== FIM DA BUSCA ==============\n");
        };

        useEffect(() => {
            fetchCharacters();
        }, []);

        useEffect(() => {
            fetchCharacters(search, page);
        }, [page]);

        const handleCardClick = (name) => {
            toast.info(`Você clicou no personagem: ${name}`, {});
        };

        const handleResetClick = () => {
            setSearch("");
            setPage(1);
            fetchCharacters("", 1);
            toast.success("Filtro foi resetado", { position: "top-right" });
        };
    
        const handleSearchClick = () => {
            setPage(1);
            fetchCharacters(search, 1);
        };
    
    console.log(characters);

    return(
        <div className={styles.container}>
            <ToastContainer
            position="top-right"
            autoClose={7500}
            theme="light"
            />
            <h1 className={styles.title}>Rick and Morty</h1>

            <div className={styles.controls}>
            <input type="text" placeholder="Search characters" className={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} />

            <button 
            onClick={() => {
                handleSearchClick("You searched for: " + search)
                fetchCharacters(search.trim())}} className={styles.searchButton}>Search</button>

            <button
            onClick={() => {
                setSearch("");
                fetchCharacters("", 1);
                handleResetClick("You reset the search")}}
            className={styles.buttonReset} >Reset</button>
            </div>

            <div className={styles.navControls}>
                <button
                onClick={() => setPage((p) => Math.max(p - 1,1))}
                disabled={page === 1 || notFound}
                className={styles.buttonNav}
                >Previous</button>

                <span className={styles.pageInfo}>Page {page} of {totalPages}
                </span>

                <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || notFound}
                className={styles.buttonNav}
                >Next</button>
            </div>

            {notFound && (
                <h1 className={styles.notFound}>Nenhum personagem encontrado</h1>
            )}

            {loading ? (
                <div className={`${styles.loaderWrapper} ${loading ? "" : styles.hidden}`}>
                    <Loader />
                </div>
            ) : (
                <div className={styles.grid}>
                    {characters.map((char) => (
                        <CharacterCard key={char.id} character={char} onClick={() => handleCardClick(char)} />
                    ))}
                </div>
            )}
        </div>
    );
}