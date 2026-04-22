import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import tovar1 from "../assets/tovar1.png";
import tovar2 from "../assets/tovar2.png";
import tovar3 from "../assets/tovar3.png";
import { EffectCoverflow } from "swiper/modules";
import React from "react";

const HERO_SLIDES = [
	{ src: tovar1, alt: "tovar 1" },
	{ src: tovar2, alt: "tovar 2" },
	{ src: tovar3, alt: "tovar 3" },
];

export default function HeroSlider() {
	return (
		<Swiper
			modules={[EffectCoverflow]}
			effect="coverflow"
			grabCursor
			centeredSlides
			slidesPerView={3}
			spaceBetween={20}
			coverflowEffect={{
				rotate: 0,
				stretch: 0,
				depth: 100,
				modifier: 2.5,
				slideShadows: false,
			}}
			className="w-full py-6">
			{HERO_SLIDES.map((slide, i) => (
				<SwiperSlide
					key={i}
					className="!w-[220px]">
					<div className="overflow-hidden rounded-2xl">
						<img
							src={slide.src}
							alt={slide.alt}
							className="h-[260px] w-full object-cover"
						/>
					</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
