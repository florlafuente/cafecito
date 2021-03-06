import React, { useState } from "react";
import PropTypes from "prop-types";

import io from "socket.io-client";

import QR from "../QR/index";

import style from "./style.scss";

import axios from "axios";

const InputText = ({ isMobile }) => {
    const [name, setName] = useState("");
    const [countCoffees, setCountCoffees] = useState(1);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchComplete, setFetchComplete] = useState(false);
    const [price] = useState(50);
    const [mercadoPagoData, setMercadoPagoData] = useState({
        mercadoPagoLink: "",
        qr: "",
    });

    const sendCoffee = async () => {
        const socket = io(`${process.env.URL}`);

        socket.on("sendToThankYouPage", (data) => {
            window.location.href = `${process.env.URL}?external_reference={"coffeeId":"${data.coffeeId}"}`;
        });

        setLoading(true);

        const url = `${process.env.URL}/api/send_coffee`;

        const result = await axios.post(url, {
            name,
            message,
            countCoffees: countCoffees || 1,
            QR: !isMobile ? true : false,
        });

        if (isMobile) {
            window.location.href = result.data.mercadoPagoLink;
        } else {
            socket.emit("assignCoffeeId", {
                coffeeId: result.data.coffeeId,
            });

            setMercadoPagoData(result.data);
            setFetchComplete(true);
        }
    };

    const tmpCountCoffees = countCoffees ? countCoffees : 1;
    const priceCoffee = tmpCountCoffees * price;

    return (
        <header className={style.inputText}>
            {loading ? (
                <>
                    <div
                        className={style.loading}
                        style={{
                            display:
                                !isMobile && fetchComplete ? "none" : "block",
                        }}
                    >
                        <span>Creando café...</span>
                    </div>

                    {!isMobile && fetchComplete && (
                        <QR data={mercadoPagoData} />
                    )}
                </>
            ) : (
                <>
                    <span>¡Ayudame con un café ☕️!</span>

                    <div className={style.containerInputCoffee}>
                        <div className={style.imageCoffee}>
                            <img
                                src="/static/imgs/coffee.png"
                                height="50"
                                alt=""
                            />
                            <span>$50</span>
                        </div>

                        <span className={style.multiplier}>x</span>

                        <div className={style.countCoffeesContainer}>
                            <button
                                onClick={() => {
                                    if (countCoffees > 1) {
                                        setCountCoffees(
                                            (preCountCoffees) =>
                                                Number(preCountCoffees) - 1
                                        );
                                    }
                                }}
                            >
                                -
                            </button>

                            <input
                                type="text"
                                placeholder="1"
                                value={countCoffees}
                                onChange={(e) => {
                                    setCountCoffees(e.target.value);
                                }}
                            />

                            <button
                                onClick={() => {
                                    setCountCoffees(
                                        (preCountCoffees) =>
                                            Number(preCountCoffees) + 1
                                    );
                                }}
                            >
                                +
                            </button>
                        </div>

                        <div className={style.buttonCoffeesContainer}>
                            <button
                                className={`${
                                    parseInt(countCoffees) === 1
                                        ? style.selected
                                        : null
                                }`}
                                onClick={() => {
                                    setCountCoffees(1);
                                }}
                            >
                                1
                            </button>
                            <button
                                className={`${
                                    parseInt(countCoffees) === 3
                                        ? style.selected
                                        : null
                                }`}
                                onClick={() => {
                                    setCountCoffees(3);
                                }}
                            >
                                3
                            </button>
                            <button
                                className={`${
                                    parseInt(countCoffees) === 5
                                        ? style.selected
                                        : null
                                }`}
                                onClick={() => {
                                    setCountCoffees(5);
                                }}
                            >
                                5
                            </button>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={name}
                        placeholder="Nombre o @Twitter (opcional)"
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                    <textarea
                        maxLength="500"
                        placeholder="Mensaje (opcional)"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                    ></textarea>
                    <button onClick={sendCoffee}>
                        {`Invitame ${tmpCountCoffees} ${
                            parseInt(tmpCountCoffees) > 1 ? "cafés" : "café"
                        } ($${priceCoffee})`}
                    </button>
                </>
            )}
        </header>
    );
};

InputText.propTypes = {
    isMobile: PropTypes.string,
};

export default InputText;
