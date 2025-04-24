"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./Home.module.css";
import CharacterCard from "../../components/CharacterCard";

export default function Home() {
    const [search, setSearch] = useState("");
    const [characters, setCharacters] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    
        const fetchCharacters = async (name, pageNumber) => {
            try {
                const { data } = await axios.get(`https://rickandmortyapi.com/api/character/?page=${pageNumber}&name=${name}`);
                setCharacters(data.results);
                setTotalPages(data.info.pages);
                setNotFound(false);
            } catch {
                setNotFound(true);
                setCharacters([]);
            }
        };

        useEffect(() => {
            fetchCharacters(search.trim(), page);
        }, [page]);

        const handleCardClick = (name) => {
            toast.info(`Você clicou no personagem: ${name}`, {});
        };

        const handleResetClick = (message) => {
            toast.info(message, {});
        }
    
        const handleSearchClick = (message) => {
            toast.info(message, {
            });
        }
    

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
                disabled={page === 1}
                className={styles.buttonNav}
                >Previous</button>
                <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={styles.buttonNav}
                >Next</button>
            </div>

            {notFound && (
                <h1 className={styles.notFound}>Nenhum personagem encontrado</h1>
            )}
            
            <div className={styles.grid}>
            {characters.map((char) => (
            <CharacterCard key={char.id} character={char} onClick={() => handleCardClick(char.name)} />
           ))}
            </div>
           
        </div>
   );
}