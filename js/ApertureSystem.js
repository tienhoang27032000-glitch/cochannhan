/**
 * VẠN CỔ TIÊN ĐỒ - MODULE HỆ THỐNG KHÔNG KHIẾU, THĂNG TIÊN & TIÊN KHIẾU (ApertureSystem.js)
 * Cập nhật Độ Khó Tu Luyện Chuẩn Nguyên Tác & Đồng Bộ Logic:
 *  - Tăng mạnh ngưỡng điểm Ôn Dưỡng Khiếu Bích từ Nhất Chuyển đến Ngũ Chuyển (450 -> 60.000).
 *  - Giảm tốc độ tăng tiến độ mỗi lần vận công, tăng mức tiêu hao Chân Nguyên & giảm tỷ lệ hồi từ Nguyên Thạch ở cấp cao.
 *  - Đồng bộ hàm getAscensionReadiness(): Bắt buộc đạt 100% Tinh Mạc Ngũ Chuyển Đỉnh Phong + 120 Nhân Khí mới được Phá Khiếu Thăng Tiên.
 *  - Tự động ghi thông báo vào Thiên Cơ Nhật Ký khi Tiên Khiếu đến hạn 300 ngày tự động độ Tai Kiếp.
 */

(function (global) {
    "use strict";

    // =========================================================================
    // 1. DỮ LIỆU HẰNG SỐ: TƯ CHẤT, THẬP TUYỆT THỂ, TIỂU CẢNH GIỚI & CHÂN NGUYÊN
    // =========================================================================

    const MIN_ASCENSION_HUMAN_QI = 240;
    const VENERABLE_REQ_DAO_MARKS = 300000;
    const VENERABLE_REQ_MYRIAD_TRIBULATIONS = 3;

    const APTITUDE_TIERS = {
        D: {
            id: "D",
            name: "Đinh Đẳng",
            minSea: 20,
            maxSea: 39,
            baseRegen: 0.22,
            cultivateMult: 0.60,
            breakthroughBonus: -0.12,
            desc: "Dung lượng biển nguyên thấp (20–39%), hồi phục rất chậm, tu luyện gian nan, phải dựa vào Tửu Trùng, Xá Lợi Cổ và cơ duyên."
        },
        C: {
            id: "C",
            name: "Bính Đẳng",
            minSea: 40,
            maxSea: 59,
            baseRegen: 0.45,
            cultivateMult: 0.90,
            breakthroughBonus: -0.02,
            desc: "Dung lượng biển nguyên trung bình (40–59%), tốc độ tu luyện bình thường, cần tích lũy tài nguyên kiên trì."
        },
        B: {
            id: "B",
            name: "Ất Đẳng",
            minSea: 60,
            maxSea: 79,
            baseRegen: 0.85,
            cultivateMult: 1.25,
            breakthroughBonus: 0.06,
            desc: "Dung lượng biển nguyên khá (60–79%), hạt giống nòng cốt của các gia tộc."
        },
        A: {
            id: "A",
            name: "Giáp Đẳng",
            minSea: 80,
            maxSea: 99,
            baseRegen: 1.40,
            cultivateMult: 1.65,
            breakthroughBonus: 0.14,
            desc: "Dung lượng biển nguyên lớn (80–99%), thiên phú tu luyện thượng thừa, có tiềm năng chạm tới Ngũ Chuyển."
        },
        TEN_EXTREME: {
            id: "TEN_EXTREME",
            name: "Thập Tuyệt Thể",
            minSea: 100,
            maxSea: 100,
            baseRegen: 2.80,
            cultivateMult: 2.65,
            breakthroughBonus: 0.25,
            desc: "Dung lượng biển nguyên viên mãn 100%, nhân khí cực kỳ dồi dào, chắc chắn kết thành Siêu Cấp Phúc Địa khi thăng tiên, nhưng ở Phàm Cảnh áp lực lên Không Khiếu tăng đều 1% mỗi 45 giây và chỉ reset về 0% khi đột phá lên một Đại Cảnh Giới mới — nếu đạt 100% sẽ BẠO TẠC CHẾT HẲN!"
        },
        SPECIAL_DREAM: {
            id: "SPECIAL_DREAM",
            name: "Thuần Mộng Cầu Chân Thể",
            minSea: 100,
            maxSea: 100,
            baseRegen: 2.60,
            cultivateMult: 2.25,
            breakthroughBonus: 0.22,
            isArtificial: true,
            desc: "Thể chất đặc thù từ Mộng Đạo, biển nguyên 100%, tốc độ tu luyện cực nhanh."
        }
    };

    const TEN_EXTREME_PHYSIQUES = [
        {
            id: "thai_nhat_duong_mang",
            name: "Thái Nhật Dương Mãng Thể",
            favoredPaths: ["Quang Đạo", "Thời Gian Đạo", "Viêm Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.035,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Tương thích cực cao với Thời Gian Đạo và Quang Đạo."
        },
        {
            id: "co_nguyet_am_hoang",
            name: "Cổ Nguyệt Âm Hoang Thể",
            favoredPaths: ["Ám Đạo", "Không Gian Đạo", "Hồn Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.035,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Mang khí tức âm hàn cổ xưa, tăng cường cổ trùng Ám Đạo và Không Gian Đạo."
        },
        {
            id: "bac_minh_bang_phach",
            name: "Bắc Minh Băng Phách Thể",
            favoredPaths: ["Băng Đạo", "Thủy Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.035,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Hàn khí cực hạn, tăng mạnh uy lực cổ trùng Băng Đạo và Thủy Đạo."
        },
        {
            id: "sam_hai_luan_hoi",
            name: "Sâm Hải Luân Hồi Thể",
            favoredPaths: ["Mộc Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.032,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Sinh cơ dồi dào, tương thích tuyệt đối với Mộc Đạo."
        },
        {
            id: "viem_hoang_loi_trach",
            name: "Viêm Hoàng Lôi Trạch Thể",
            favoredPaths: ["Viêm Đạo", "Lôi Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.038,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Chứa đựng uy năng hỏa diễm và lôi đình cuồng bạo."
        },
        {
            id: "van_kim_dieu_hoa",
            name: "Vạn Kim Diệu Hoa Thể",
            favoredPaths: ["Kim Đạo", "Kiếm Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.035,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Sắc bén vô song, tăng cường cổ trùng Kim Đạo."
        },
        {
            id: "dai_luc_chan_vu",
            name: "Đại Lực Chân Vũ Thể",
            favoredPaths: ["Lực Đạo"],
            guPowerBonus: 0.28,
            pressureRate: 0.035,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Nội hàm thần lực bẩm sinh, phát huy cực đại uy năng Lực Đạo."
        },
        {
            id: "tieu_dao_tri_tam",
            name: "Tiêu Dao Trí Tâm Thể",
            favoredPaths: ["Trí Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.030,
            isCanonical: true,
            desc: "Một trong Thập Tuyệt Thể nguyên thủy. Tư duy nhạy bén, tăng mạnh hiệu quả thôi diễn sát chiêu và cổ trùng Trí Đạo."
        },
        {
            id: "hau_tho_nguyen_uong",
            name: "Hậu Thổ Nguyên Ương Thể",
            favoredPaths: ["Thổ Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.030,
            isCanonical: false,
            isExtended: true,
            desc: "[Thiết kế mở rộng] Thể chất đại diện cho Thổ Đạo trầm ổn, gia tăng phòng ngự và nền tảng địa khí."
        },
        {
            id: "vu_tru_dai_dien",
            name: "Vũ Trụ Đại Diễn Thể",
            favoredPaths: ["Luyện Đạo", "Vận Đạo", "Không Gian Đạo"],
            guPowerBonus: 0.25,
            pressureRate: 0.035,
            isCanonical: false,
            isExtended: true,
            desc: "[Thiết kế mở rộng] Thể chất thiên về diễn hóa quy luật thiên địa và hỗ trợ Luyện Đạo."
        }
    ];

    /**
     * 4 Tiểu Cảnh Giới dùng chung cho cả Phàm Cảnh (1–5 Chuyển) và Tiên Cảnh (6–9 Chuyển):
     * Sơ Giai -> Trung Giai -> Cao Giai -> Đỉnh Phong
     * Đã nâng hệ số yêu cầu (statMult) và số lần Độ Tai Kiếp (immortalTribulationsReq: 4 -> 6 -> 9 -> 12)
     */
    const MORTAL_SUBSTAGES = [
        {
            index: 0,
            name: "Sơ Giai",
            wallName: "Khinh Mạc (Màng Ánh Sáng)",
            statMult: 1.0,
            wallHpMax: 100,
            immortalTribulationsReq: 14
        },
        {
            index: 1,
            name: "Trung Giai",
            wallName: "Thủy Mạc (Màng Nước)",
            statMult: 1.45,
            wallHpMax: 180,
            immortalTribulationsReq: 20
        },
        {
            index: 2,
            name: "Cao Giai",
            wallName: "Thạch Mạc (Màng Đá)",
            statMult: 2.05,
            wallHpMax: 300,
            immortalTribulationsReq: 28
        },
        {
            index: 3,
            name: "Đỉnh Phong",
            wallName: "Tinh Mạc (Màng Kết Tinh)",
            statMult: 2.85,
            wallHpMax: 450,
            immortalTribulationsReq: 36
        },
        {
            index: 4,
            name: "Á Tiên Tôn",
            wallName: "Thái Cổ Động Thiên Cực Hạn",
            statMult: 3.60,
            wallHpMax: 700,
            immortalTribulationsReq: 3
        }
    ];

    /**
     * Ngưỡng điểm Ôn Dưỡng Khiếu Bích (baseWallReq) đã nâng cao để quá trình tu luyện đầm và lâu dài
     */
    const MORTAL_RANKS = {
        1: {
            rank: 1,
            name: "Nhất Chuyển",
            essenceName: "Thanh Đồng Chân Nguyên",
            shortEssence: "Thanh Đồng",
            cssClass: "essence-rank-1",
            colorPrimary: "#196b4d",
            colorSecondary: "#38c992",
            densityMultiplier: 1,
            baseWallReq: 1200
        },
        2: {
            rank: 2,
            name: "Nhị Chuyển",
            essenceName: "Xích Thiết Chân Nguyên",
            shortEssence: "Xích Thiết",
            cssClass: "essence-rank-2",
            colorPrimary: "#801f19",
            colorSecondary: "#e6483d",
            densityMultiplier: 8,
            baseWallReq: 4800
        },
        3: {
            rank: 3,
            name: "Tam Chuyển",
            essenceName: "Bạch Ngân Chân Nguyên",
            shortEssence: "Bạch Ngân",
            cssClass: "essence-rank-3",
            colorPrimary: "#6e7d85",
            colorSecondary: "#e1eef5",
            densityMultiplier: 64,
            baseWallReq: 18000
        },
        4: {
            rank: 4,
            name: "Tứ Chuyển",
            essenceName: "Hoàng Kim Chân Nguyên",
            shortEssence: "Hoàng Kim",
            cssClass: "essence-rank-4",
            colorPrimary: "#8f6812",
            colorSecondary: "#f7c948",
            densityMultiplier: 512,
            baseWallReq: 65000
        },
        5: {
            rank: 5,
            name: "Ngũ Chuyển",
            essenceName: "Tử Tinh Chân Nguyên",
            shortEssence: "Tử Tinh",
            cssClass: "essence-rank-5",
            colorPrimary: "#531b8f",
            colorSecondary: "#b75cff",
            densityMultiplier: 4096,
            baseWallReq: 220000
        }
    };

    const IMMORTAL_RANKS = {
        6: {
            rank: 6,
            name: "Lục Chuyển",
            titleSuffix: "Cổ Tiên",
            essenceName: "Lục Đề Tiên Nguyên",
            apertureType: "Phúc Địa",
            cssClass: "essence-rank-6",
            colorPrimary: "#4cd964",
            beadValueInRank6: 1
        },
        7: {
            rank: 7,
            name: "Thất Chuyển",
            titleSuffix: "Cổ Tiên",
            essenceName: "Hồng Táo Tiên Nguyên",
            apertureType: "Phúc Địa",
            cssClass: "essence-rank-7",
            colorPrimary: "#ff3b30",
            beadValueInRank6: 100
        },
        8: {
            rank: 8,
            name: "Bát Chuyển",
            titleSuffix: "Cổ Tiên",
            essenceName: "Bạch Lệ Tiên Nguyên",
            apertureType: "Động Thiên",
            cssClass: "essence-rank-8",
            colorPrimary: "#d9ecff",
            beadValueInRank6: 10000
        },
        9: {
            rank: 9,
            name: "Cửu Chuyển",
            titleSuffix: "Tôn Giả",
            essenceName: "Hoàng Hạnh Tiên Nguyên",
            apertureType: "Chí Tôn Động Thiên",
            cssClass: "essence-rank-9",
            colorPrimary: "#ffcc00",
            beadValueInRank6: 1000000
        }
    };

    const BLESSED_LAND_GRADES = {
        SMALL: {
            id: "SMALL",
            name: "Tiểu Cấp Phúc Địa",
            minSpaceAcres: 1500,
            maxSpaceAcres: 2900,
            timeRatio: 10,
            essenceBeadPerYear: 10
        },
        MEDIUM: {
            id: "MEDIUM",
            name: "Trung Cấp Phúc Địa",
            minSpaceAcres: 3200,
            maxSpaceAcres: 5900,
            timeRatio: 16,
            essenceBeadPerYear: 18
        },
        LARGE: {
            id: "LARGE",
            name: "Đại Cấp Phúc Địa",
            minSpaceAcres: 6200,
            maxSpaceAcres: 9800,
            timeRatio: 24,
            essenceBeadPerYear: 30
        },
        SUPER: {
            id: "SUPER",
            name: "Siêu Cấp Phúc Địa",
            minSpaceAcres: 10500,
            maxSpaceAcres: 18000,
            timeRatio: 36,
            essenceBeadPerYear: 50
        }
    };

    const RITUAL_STEPS_DATA = [
        {
            step: 1,
            title: "Bước 1/7: Đến Địa Điểm Khai Khiếu",
            text: "Ngươi theo chân tộc lão bước xuống địa đạo tối tăm, tiến vào Tinh Hà Điện dưới lòng đất. Trước mắt là dòng suối ngầm lấp lánh ánh sáng của hàng vạn con Hy Vọng Cổ."
        },
        {
            step: 2,
            title: "Bước 2/7: Tham Gia Nghi Thức",
            text: "Tộc trưởng trầm giọng tuyên đọc tổ huấn. Ngươi hít sâu một hơi, bước xuống dòng nước lạnh buốt, bắt đầu lội qua dòng sông ánh sáng."
        },
        {
            step: 3,
            title: "Bước 3/7: Cảm Ứng Hy Vọng Cổ (Xác Định Tư Chất)",
            text: "Từng điểm sáng của Hy Vọng Cổ bị khí tức sinh mệnh của ngươi thu hút, lũ lượt chui vào cơ thể và tụ tập dưới vùng bụng dưới!"
        },
        {
            step: 4,
            title: "Bước 4/7: Phá Vỡ Hư Không — Mở Khiếu",
            text: "ẦM! Giữa hư không tăm tối trong cơ thể vang lên một tiếng nổ vô hình. Ánh sáng Hy Vọng Cổ xé toạc bóng tối, mở ra một không gian Không Khiếu độc lập!"
        },
        {
            step: 5,
            title: "Bước 5/7: Hình Thành Biển Nguyên & Khiếu Bích",
            text: "Bốn phía Không Khiếu ngưng tụ thành một lớp màng ánh sáng mỏng (Khinh Mạc). Bên dưới đáy khiếu, dòng nước màu xanh đồng bắt đầu dâng lên tạo thành Biển Nguyên."
        },
        {
            step: 6,
            title: "Bước 6/7: Định Hình Tư Chất & Thu Hút Nguyên Khí",
            text: "Mực nước Thanh Đồng Biển Nguyên dần ổn định, phản ánh rõ ràng giới hạn tư chất bẩm sinh và khả năng hấp thu nguyên khí thiên địa của ngươi."
        },
        {
            step: 7,
            title: "Bước 7/7: Trở Thành Cổ Sư Nhất Chuyển Sơ Giai",
            text: "Nghi thức hoàn tất! Ngươi đã chính thức thoát khỏi thân phận phàm nhân, bước vào con đường Cổ Sư Nhất Chuyển Sơ Giai đầy máu lửa và cơ duyên."
        }
    ];

    // =========================================================================
    // 2. LỚP QUẢN LÝ KHÔNG KHIẾU & TU LUYỆN (CLASS APERTURESYSTEM)
    // =========================================================================

    class ApertureSystem {
        constructor() {
            this.game = null;
            this.ui = null;
            this.reset();
        }

        init(systems = {}) {
            if (systems.game) {
                this.game = systems.game;
            }
            if (systems.ui) {
                this.ui = systems.ui;
            }
        }

        reset() {
            this.isAwakened = false;
            this.isImmortal = false;

            this.aptitude = {
                grade: "C",
                gradeName: "Bính Đẳng",
                maxSeaPercent: 50,
                baseRegen: 0.45,
                cultivateMult: 0.90,
                breakthroughBonus: -0.02,
                physique: null
            };

            this.rank = 1;
            this.subStage = 0; // 0: Sơ Giai, 1: Trung Giai, 2: Cao Giai, 3: Đỉnh Phong

            this.currentEssence = 0;
            this.maxEssenceCap = 100;

            this.wallProgress = 0;
            this.maxWallProgress = MORTAL_RANKS[1].baseWallReq;
            this.wallPressure = 0;
            this.wallIntegrity = 100;
            this.hasExploded = false;
            this._pressureWarned = false;
            this.tenExtremeSealed = false;
            this.pressureFreezeTimer = 0;

            // Tiến trình Thăng Tôn (Á Tiên Tôn -> Cửu Chuyển) & Đạo Chủ
            this.daoBlockadeBroken = false;
            this.daoLordPath = null;
            this.naturalDaoMarksRefined = 0;

            this.isMeditating = false;
            this.vitalGuId = null;
            this.vitalGuName = "Chưa luyện hóa";

            this.humanQi = 10;

            this.immortalEssence = {
                6: 0,
                7: 0,
                8: 0,
                9: 0
            };

            this.immortalAperture = {
                active: false,
                gradeId: "MEDIUM",
                gradeName: "Trung Cấp Phúc Địa",
                spaceAcres: 0,
                timeRatio: 16,
                internalDays: 0,
                calamityCountdownDays: 1200,
                lastYieldAt: 0,
                subStageTribulationsPassed: 0,
                subStageTribulationsRequired: 14,
                earthlyCalamitiesPassed: 0,
                heavenlyTribulationsPassed: 0,
                grandTribulationsPassed: 0,
                myriadTribulationsPassed: 0,
                originCoreStability: 100,
                resources: {
                    primevalStonesOutput: 5,
                    herbsNodes: 2,
                    oreVeins: 1,
                    guWormsWild: 3,
                    immortalMaterialPoints: 0
                },
                livingBeings: {
                    mortals: 0,
                    beasts: 12,
                    variantHumans: 0
                },
                environmentNodes: []
            };

            this.ascensionState = {
                inProgress: false,
                stage: 0,
                heavenQi: 100,
                earthQi: 100,
                humanQiCommitted: 100,
                balanceScore: 90,
                tribulationHp: 100,
                tribulationMaxHp: 100,
                logs: []
            };

            this.ritualState = {
                currentStep: 1,
                originType: "righteous_clan",
                particles: [],
                animTick: 0,
                rolledAptitude: null,
                rolledVitalGu: null
            };

            this._initRitualParticles();
        }

        // =====================================================================
        // 3. NGHI THỨC KHAI KHIẾU 7 BƯỚC & XÁC ĐỊNH TƯ CHẤT
        // =====================================================================

        _initRitualParticles() {
            this.ritualState.particles = [];
            for (let i = 0; i < 48; i++) {
                this.ritualState.particles.push({
                    x: Math.random() * 420,
                    y: Math.random() * 210,
                    r: 1.5 + Math.random() * 2.5,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: -0.3 - Math.random() * 0.7,
                    alpha: 0.3 + Math.random() * 0.7
                });
            }
        }

        startAwakeningRitual(originType = "righteous_clan") {
            this.ritualState.currentStep = 1;
            this.ritualState.originType = originType;
            this.ritualState.rolledAptitude = this._rollAptitudeByOrigin(originType);
            this.ritualState.rolledVitalGu = this._rollInitialVitalGu(originType, this.ritualState.rolledAptitude);
            return this.getCurrentRitualStepData();
        }

        _rollAptitudeByOrigin(originType) {
            let weights = { D: 30, C: 42, B: 19, A: 7.5, TEN_EXTREME: 1.5 };

            if (originType === "righteous_clan" || originType === "clan") {
                weights = { D: 22, C: 44, B: 23, A: 9.0, TEN_EXTREME: 2.0 };
            } else if (originType === "central_sect") {
                weights = { D: 18, C: 42, B: 27, A: 11.0, TEN_EXTREME: 2.0 };
            } else if (originType === "lone_cultivator" || originType === "commoner") {
                weights = { D: 34, C: 42, B: 16, A: 6.0, TEN_EXTREME: 2.0 };
            } else if (originType === "demonic_inheritor" || originType === "inheritance") {
                weights = { D: 25, C: 38, B: 23, A: 11.0, TEN_EXTREME: 3.0 };
            }

            const total = Object.values(weights).reduce((a, b) => a + b, 0);
            let roll = Math.random() * total;
            let chosenTierKey = "C";

            for (const [key, weight] of Object.entries(weights)) {
                if (roll < weight) {
                    chosenTierKey = key;
                    break;
                }
                roll -= weight;
            }

            const tierInfo = APTITUDE_TIERS[chosenTierKey];
            const seaCap = Math.floor(
                tierInfo.minSea + Math.random() * (tierInfo.maxSea - tierInfo.minSea + 1)
            );

            let physique = null;
            if (chosenTierKey === "TEN_EXTREME") {
                const randIndex = Math.floor(Math.random() * TEN_EXTREME_PHYSIQUES.length);
                physique = TEN_EXTREME_PHYSIQUES[randIndex];
            }

            return {
                grade: chosenTierKey,
                gradeName: physique ? `${tierInfo.name} — ${physique.name}` : tierInfo.name,
                maxSeaPercent: seaCap,
                baseRegen: Number((tierInfo.baseRegen * (seaCap / 60)).toFixed(2)),
                cultivateMult: tierInfo.cultivateMult,
                breakthroughBonus: tierInfo.breakthroughBonus,
                physique: physique,
                desc: physique ? physique.desc : tierInfo.desc
            };
        }

        _rollInitialVitalGu(originType, aptitude) {
            if (aptitude.physique) {
                const path = aptitude.physique.favoredPaths[0];
                if (path === "Lực Đạo") return { id: "hung_luc_gu", name: "Hắc Thỉ Cổ (Nhất Chuyển - Lực Đạo)" };
                if (path === "Viêm Đạo") return { id: "hoa_cau_gu", name: "Xích Diễm Cổ (Nhất Chuyển - Viêm Đạo)" };
                if (path === "Băng Đạo" || path === "Thủy Đạo") return { id: "han_bang_gu", name: "Hàn Sương Cổ (Nhất Chuyển - Băng Đạo)" };
            }

            switch (originType) {
                case "righteous_clan":
                case "clan":
                    return { id: "nguyet_quang_gu", name: "Nguyệt Quang Cổ (Nhất Chuyển - Quang Đạo)" };
                case "central_sect":
                    return { id: "phong_nhan_gu", name: "Phong Nhận Cổ (Nhất Chuyển - Phong Đạo)" };
                case "lone_cultivator":
                case "commoner":
                case "orphan":
                    return { id: "thiet_bi_gu", name: "Đồng Bì Cổ (Nhất Chuyển - Kim Đạo)" };
                case "merchant_heir":
                case "adopted":
                    return { id: "thanh_phong_gu", name: "Thanh Phong Luân Cổ (Nhất Chuyển - Phong Đạo)" };
                case "demonic_inheritor":
                case "inheritance":
                    return { id: "huyet_nguyet_gu", name: "Huyết Nguyệt Cổ (Nhất Chuyển - Huyết Đạo)" };
                default:
                    return { id: "nguyet_quang_gu", name: "Nguyệt Quang Cổ (Nhất Chuyển - Quang Đạo)" };
            }
        }

        advanceRitualStep() {
            if (this.ritualState.currentStep < 7) {
                this.ritualState.currentStep += 1;
            }
            if (this.ritualState.currentStep === 7 && !this.isAwakened) {
                this.finalizeAwakening();
            }
            return this.getCurrentRitualStepData();
        }

        getCurrentRitualStepData() {
            const stepObj = RITUAL_STEPS_DATA[this.ritualState.currentStep - 1];
            return {
                step: stepObj.step,
                title: stepObj.title,
                text: stepObj.text,
                isFinished: this.ritualState.currentStep >= 7,
                aptitudeResult: this.ritualState.rolledAptitude,
                vitalGuResult: this.ritualState.rolledVitalGu
            };
        }

        finalizeAwakening() {
            const rolled = this.ritualState.rolledAptitude || this._rollAptitudeByOrigin("righteous_clan");
            const vital = this.ritualState.rolledVitalGu || { id: "nguyet_quang_gu", name: "Nguyệt Quang Cổ" };

            this.isAwakened = true;
            this.isImmortal = false;
            this.aptitude = { ...rolled };
            this.rank = 1;
            this.subStage = 0;

            this.currentEssence = rolled.maxSeaPercent;
            this.wallProgress = 0;
            this.maxWallProgress = MORTAL_RANKS[1].baseWallReq;
            this.wallPressure = rolled.physique ? 0 : 5;
            this.vitalGuId = vital.id;
            this.vitalGuName = vital.name;

            if (rolled.physique) {
                this.humanQi = 40;
            } else if (rolled.grade === "A") {
                this.humanQi = 18;
            } else {
                this.humanQi = 10;
            }
        }

        // =====================================================================
        // 4. VÒNG LẶP CẬP NHẬT CHÂN NGUYÊN, ÁP LỰC KHIẾU & TIÊN KHIẾU
        // =====================================================================

        update(dt, player) {
            if (!this.isAwakened) return;

            this.ritualState.animTick += dt;

            if (!this.isImmortal) {
                const maxCap = this.aptitude.maxSeaPercent;
                if (this.currentEssence < maxCap) {
                    let regenRate = this.aptitude.baseRegen;
                    if (this.isMeditating) regenRate *= 1.5;
                    this.currentEssence = Math.min(maxCap, this.currentEssence + regenRate * dt);
                }

                if (this.isMeditating) {
                    this.cultivateStep(dt, 0.35);
                } else {
                    if (!this.aptitude.physique && this.wallPressure > 5) {
                        this.wallPressure = Math.max(5, this.wallPressure - 1.2 * dt);
                    }
                }

                if (this.aptitude.physique && !this.hasExploded) {
                    if (this.tenExtremeSealed) {
                        // Đã dùng Âm Dương Chuyển Thân Cổ phong ấn xuống Giáp Đẳng (90%): an toàn tuyệt đối
                        this.wallPressure = 0;
                        this._pressureWarned = false;
                    } else if (this.pressureFreezeTimer > 0) {
                        // Đang được Định Nguyên Tịnh Khiếu Cổ đóng băng áp lực
                        this.pressureFreezeTimer = Math.max(0, this.pressureFreezeTimer - dt);
                    } else {
                        // Thập Tuyệt Thể ở Phàm Cảnh: tăng đúng 1% mỗi 45 giây, chỉ reset về 0% khi tăng 1 Đại Cảnh Giới
                        const pRate = 1 / 45;
                        this.wallPressure = Math.min(100, this.wallPressure + pRate * dt);

                        const uiRef = this.ui || (global.vanCoTienDoGame && global.vanCoTienDoGame.ui);
                        if (this.wallPressure >= 80 && !this._pressureWarned) {
                            this._pressureWarned = true;
                            if (uiRef && typeof uiRef.addLog === "function") {
                                uiRef.addLog(
                                    "🚨 [CẢNH BÁO SINH TỬ - THẬP TUYỆT THỂ] Áp lực Không Khiếu đã vượt 80%! Hãy nhanh chóng đột phá Đại Cảnh Giới hoặc dùng Âm Dương Chuyển Thân Cổ / Thạch Khiếu Cổ trước khi đạt 100% (Bạo tạc chết hẳn)!",
                                    "danger"
                                );
                            }
                        } else if (this.wallPressure < 70) {
                            this._pressureWarned = false;
                        }

                        if (this.wallPressure >= 100) {
                            this.hasExploded = true;
                            const gameRef = this.game || global.vanCoTienDoGame;
                            if (gameRef && typeof gameRef.triggerPermadeath === "function") {
                                gameRef.triggerPermadeath(
                                    `Áp lực 【${this.aptitude.physique.name}】 chạm ngưỡng 100% ở Phàm Cảnh (${this.getRealmDisplayName()}) — Không Khiếu nứt toác, tự bạo thành tro bụi!`
                                );
                            }
                            return;
                        }
                    }
                }
            } else if (this.immortalAperture.active) {
                // Tiên Cảnh tu luyện dài hơi chuẩn nguyên tác (chậm & đầm)
                const internalDaysDelta = (dt / 72) * this.immortalAperture.timeRatio;
                this.immortalAperture.internalDays += internalDaysDelta;
                this.immortalAperture.calamityCountdownDays = Math.max(
                    0,
                    this.immortalAperture.calamityCountdownDays - internalDaysDelta
                );

                const gradeConfig = BLESSED_LAND_GRADES[this.immortalAperture.gradeId] || BLESSED_LAND_GRADES.MEDIUM;
                const beadRatePerDay = (gradeConfig.essenceBeadPerYear * 0.35) / 365;
                this.immortalEssence[this.rank] += beadRatePerDay * internalDaysDelta;

                if (this.immortalAperture.calamityCountdownDays <= 0) {
                    this.immortalAperture.calamityCountdownDays = 1200;
                    const calamityRes = this._triggerApertureCalamity(player, false);
                    const uiRef = this.ui || (global.vanCoTienDoGame && global.vanCoTienDoGame.ui);

                    if (calamityRes && calamityRes.message && uiRef && typeof uiRef.addLog === "function") {
                        uiRef.addLog(calamityRes.message, calamityRes.didAdvance ? "loot" : "warning");
                        if (typeof uiRef.updateHUD === "function") {
                            uiRef.updateHUD();
                        }
                    }
                }
            }
        }

        // =====================================================================
        // 5. CƠ CHẾ TIÊU HAO, QUY ĐỔI & HỒI PHỤC CHÂN NGUYÊN (ĐÃ SIẾT CHẶT)
        // =====================================================================

        calculateEssenceCost(baseCost, guRank = 1, guPath = null) {
            if (this.isImmortal) {
                if (guRank <= 5) {
                    return { canUse: true, isImmortalCost: true, rank: this.rank, cost: 0.01 };
                }
                const rankDiff = guRank - this.rank;
                let beadCost = baseCost * Math.pow(100, Math.max(0, rankDiff)) * (rankDiff < 0 ? Math.pow(0.01, -rankDiff) : 1);
                // Quyền năng Đạo Chủ Cửu Chuyển: giảm 30% tiêu hao Tiên Nguyên khi thúc giục Cổ cùng lưu phái Đạo Chủ
                if (this.rank >= 9 && this.daoLordPath && guPath && guPath === this.daoLordPath) {
                    beadCost *= 0.70;
                }
                return { canUse: true, isImmortalCost: true, rank: this.rank, cost: Number(Math.max(0.01, beadCost).toFixed(4)) };
            }

            if (guRank >= 6) {
                return { canUse: false, reason: "Phàm nhân không có Tiên Nguyên để thúc giục Tiên Cổ!" };
            }

            const playerDensity = MORTAL_RANKS[this.rank].densityMultiplier;
            const guDensity = MORTAL_RANKS[guRank].densityMultiplier;

            let ratio = guDensity / playerDensity;
            if (guRank < this.rank) {
                ratio = Math.max(0.10, Math.pow(0.48, this.rank - guRank));
            } else if (guRank > this.rank) {
                ratio = Math.pow(2.6, guRank - this.rank);
            }

            const finalCost = Number((baseCost * ratio).toFixed(2));
            return {
                canUse: true,
                isImmortalCost: false,
                cost: finalCost,
                overRankPenalty: Math.max(0, guRank - this.rank)
            };
        }

        hasEnoughEssence(baseCost, guRank = 1, guPath = null) {
            if (!this.isAwakened) return false;
            const calc = this.calculateEssenceCost(baseCost, guRank, guPath);
            if (calc.canUse === false) return false;

            if (calc.isImmortalCost) {
                return this.immortalEssence[this.rank] >= calc.cost;
            }
            return this.currentEssence >= calc.cost && this.currentEssence > 0;
        }

        consumeEssence(baseCost, guRank = 1, guPath = null) {
            if (!this.hasEnoughEssence(baseCost, guRank, guPath)) {
                return {
                    success: false,
                    reason: this.currentEssence <= 0
                        ? "Biển Nguyên đã cạn kiệt (0%)! Không thể thúc giục Cổ Trùng."
                        : "Không đủ Chân Nguyên để kích hoạt!"
                };
            }

            const calc = this.calculateEssenceCost(baseCost, guRank, guPath);

            if (calc.isImmortalCost) {
                this.immortalEssence[this.rank] = Math.max(0, this.immortalEssence[this.rank] - calc.cost);
                return { success: true, cost: calc.cost, isImmortal: true };
            }

            this.currentEssence = Math.max(0, Number((this.currentEssence - calc.cost).toFixed(2)));

            if (!this.aptitude.physique) {
                if (calc.overRankPenalty > 0) {
                    this.wallPressure = Math.min(100, this.wallPressure + calc.overRankPenalty * 10);
                } else {
                    this.wallPressure = Math.min(100, this.wallPressure + 0.3);
                }
            }

            return {
                success: true,
                cost: calc.cost,
                remaining: this.currentEssence,
                depleted: this.currentEssence <= 0
            };
        }

        /**
         * Hấp thu Nguyên Thạch: Cảnh giới càng cao, 1 viên Nguyên Thạch phàm phẩm hồi càng ít % Chân Nguyên
         */
        absorbPrimevalStone(stoneCount = 1) {
            if (!this.isAwakened) {
                return { success: false, message: "Chưa Khai Khiếu, không thể hấp thu Nguyên Thạch!" };
            }
            if (this.isImmortal) {
                this.immortalAperture.originCoreStability = Math.min(100, this.immortalAperture.originCoreStability + 1 * stoneCount);
                return { success: true, restored: 0, message: `Đã ném ${stoneCount} Nguyên Thạch vào Tiên Khiếu để bồi bổ nguyên khí.` };
            }

            const maxCap = this.aptitude.maxSeaPercent;
            if (this.currentEssence >= maxCap) {
                return { success: false, message: `Biển Nguyên đã đầy ở mức giới hạn tư chất (${maxCap}%)!` };
            }

            const restoreByRank = { 1: 12, 2: 7.5, 3: 4.5, 4: 2.5, 5: 1.4 };
            const restorePerStone = restoreByRank[this.rank] || 2.0;
            const totalRestore = restorePerStone * stoneCount;
            const before = this.currentEssence;
            this.currentEssence = Math.min(maxCap, Number((this.currentEssence + totalRestore).toFixed(1)));

            return {
                success: true,
                restored: Number((this.currentEssence - before).toFixed(1)),
                message: `Hấp thu ${stoneCount} Nguyên Thạch, khôi phục ${(this.currentEssence - before).toFixed(1)}% ${MORTAL_RANKS[this.rank].essenceName}.`
            };
        }

        /**
         * Hấp thu tự động vừa đủ số Nguyên Thạch để bơm đầy Biển Nguyên
         */
        absorbPrimevalStonesToFull(player) {
            if (!this.isAwakened) {
                return { success: false, message: "Chưa Khai Khiếu, không thể hấp thu Nguyên Thạch!" };
            }
            if (this.isImmortal) {
                return { success: false, message: "Cổ Tiên dùng Tiên Nguyên Thạch hoặc chờ Phúc Địa sinh Tiên Nguyên!" };
            }
            if (!player || player.primevalStones <= 0) {
                return { success: false, message: "Không còn Nguyên Thạch trong hành trang!" };
            }
            const maxCap = this.aptitude.maxSeaPercent;
            const deficit = maxCap - this.currentEssence;
            if (deficit <= 0.1) {
                return { success: false, message: `Biển Nguyên đã đầy ở mức giới hạn (${maxCap}%)!` };
            }

            const restoreByRank = { 1: 12, 2: 7.5, 3: 4.5, 4: 2.5, 5: 1.4 };
            const perStone = restoreByRank[this.rank] || 1.4;
            const needed = Math.ceil(deficit / perStone);
            const actualUse = Math.min(player.primevalStones, Math.max(1, needed));

            const res = this.absorbPrimevalStone(actualUse);
            if (res.success) {
                player.primevalStones -= actualUse;
                res.stonesUsed = actualUse;
            }
            return res;
        }

        // =====================================================================
        // 6. ÔN DƯỠNG KHIẾU BÍCH & ĐỘT PHÁ CẢNH GIỚI PHÀM CẢNH (CHẬM & CHẮC)
        // =====================================================================

        hasLiquorWormAssist() {
            const guSys = (this.game && this.game.guSystem) || (global.vanCoTienDoGame && global.vanCoTienDoGame.guSystem);
            if (!guSys || !Array.isArray(guSys.ownedGuList)) return false;
            return guSys.ownedGuList.some(
                g => g.id === "tuu_trung_gu" && g.isRefined && (g.hunger === undefined || g.hunger > 0)
            );
        }

        cultivateStep(dt = 5.0, externalBonus = 1.0) {
            if (!this.isAwakened) return { success: false };

            if (this.isImmortal) {
                return {
                    success: false,
                    reason: "Đã thành tựu Cổ Tiên! Hãy tích lũy Tiên Nguyên, Nhân Khí và vượt Tai Kiếp để tấn thăng tiểu cảnh giới."
                };
            }

            const essenceNeeded = Number((3.2 * dt).toFixed(1));
            if (this.currentEssence < essenceNeeded) {
                this.isMeditating = false;
                return {
                    success: false,
                    reason: `Chân nguyên trong Biển Nguyên không đủ (cần ${essenceNeeded}%)! Hãy chờ hồi phục hoặc hấp thu Nguyên Thạch.`
                };
            }

            this.currentEssence = Math.max(0, Number((this.currentEssence - essenceNeeded).toFixed(1)));

            const hasLiquorWorm = this.hasLiquorWormAssist();
            let gain = 0;

            if (dt >= 4.5) {
                // Mỗi lần vận công thủ công: 15–22 XP (nếu có Tửu Trùng phụ trợ: 50–70 XP)
                gain = hasLiquorWorm
                    ? Math.floor(50 + Math.random() * 21)
                    : Math.floor(15 + Math.random() * 8);
            } else {
                // Bế quan tự động (theo nhịp thời gian thực: tương đương 1 lần vận công mỗi 5 giây)
                const perCycleAvg = hasLiquorWorm ? 60 : 18.5;
                gain = Number(((perCycleAvg / 5) * dt).toFixed(2));
            }

            const before = this.wallProgress;
            this.wallProgress = Math.min(this.maxWallProgress, Number((this.wallProgress + gain).toFixed(1)));
            if (!this.aptitude.physique) {
                this.wallPressure = Math.min(100, this.wallPressure + 0.65 * dt);
            }

            return {
                success: true,
                gainedXp: Number((this.wallProgress - before).toFixed(1)),
                rawGain: gain,
                hasLiquorWorm: hasLiquorWorm,
                wallProgress: this.wallProgress,
                maxWallProgress: this.maxWallProgress,
                canBreakthrough: this.wallProgress >= this.maxWallProgress
            };
        }

        attemptBreakthrough() {
            if (!this.isAwakened) {
                return { success: false, message: "Ngươi vẫn là phàm nhân chưa Khai Khiếu!" };
            }
            if (this.isImmortal) {
                return { success: false, message: "Cổ Tiên tấn thăng cảnh giới bằng cách Độ Tai Kiếp trong Tiên Khiếu!" };
            }
            if (this.wallProgress < this.maxWallProgress) {
                return {
                    success: false,
                    message: `Khiếu Bích chưa ôn dưỡng viên mãn (${Math.floor(this.wallProgress)}/${this.maxWallProgress})!`
                };
            }

            if (this.rank === 5 && this.subStage === 3) {
                return {
                    success: false,
                    requireAscension: true,
                    message: "Đã đạt Ngũ Chuyển Đỉnh Phong viên mãn! Hãy bấm nút '🌌 Phá Khiếu Thăng Tiên (Tam Khí Hợp Nhất)' bên dưới!"
                };
            }

            const isMajorRankBreakthrough = this.subStage === 3;
            const reqEssence = isMajorRankBreakthrough
                ? Math.min(this.aptitude.maxSeaPercent, 45)
                : Math.min(this.aptitude.maxSeaPercent, 28);

            if (this.currentEssence < reqEssence) {
                return {
                    success: false,
                    message: `Cần tối thiểu ${reqEssence}% Chân Nguyên trong Biển Nguyên để xung kích rào cản cảnh giới!`
                };
            }

            let baseChance = isMajorRankBreakthrough ? 0.58 : 0.78;
            baseChance += this.aptitude.breakthroughBonus;
            baseChance += (this.currentEssence / 100) * 0.14;
            baseChance -= (this.rank - 1) * 0.05;
            baseChance = Math.max(0.25, Math.min(0.95, baseChance));

            this.currentEssence = Math.max(0, Number((this.currentEssence - reqEssence).toFixed(1)));

            if (Math.random() <= baseChance) {
                if (isMajorRankBreakthrough) {
                    this.rank += 1;
                    this.subStage = 0;
                    this.humanQi += 6 * this.rank;
                } else {
                    this.subStage += 1;
                    this.humanQi += 2 * this.rank;
                }

                let pressureResetNote = "";
                if (this.aptitude.physique) {
                    if (isMajorRankBreakthrough) {
                        this.wallPressure = 0;
                        this._pressureWarned = false;
                        pressureResetNote = " Áp lực Thập Tuyệt Thể đã được reset hoàn toàn về 0%!";
                    }
                } else {
                    const relief = isMajorRankBreakthrough ? 80 : 55;
                    this.wallPressure = Math.max(5, this.wallPressure - relief);
                    if (this.wallPressure < 70) this._pressureWarned = false;
                }
                this.wallProgress = 0;
                this.maxWallProgress = Math.round(
                    MORTAL_RANKS[this.rank].baseWallReq * MORTAL_SUBSTAGES[this.subStage].statMult
                );

                return {
                    success: true,
                    newRealmName: this.getRealmDisplayName(),
                    wallName: this.getApertureWallName(),
                    message: `⚡ Đột phá thành công! Cảnh giới tấn thăng lên 【${this.getRealmDisplayName()}】, Khiếu Bích ngưng tụ thành ${this.getApertureWallName()}!${pressureResetNote}`
                };
            } else {
                // Thất bại sẽ sụt giảm tiến độ Khiếu Bích về 60%, đòi hỏi ôn dưỡng lại
                this.wallProgress = Math.floor(this.maxWallProgress * 0.60);
                if (!this.aptitude.physique) {
                    this.wallPressure = Math.min(100, this.wallPressure + 18);
                }
                return {
                    success: false,
                    message: `Xung kích cảnh giới thất bại! Khiếu Bích chấn động dữ dội, tiến độ ôn dưỡng sụt xuống còn ${this.wallProgress}/${this.maxWallProgress}.`
                };
            }
        }

        // =====================================================================
        // 7. PHÁ KHIẾU THĂNG TIÊN & ĐỘ TAI KIẾP CỔ TIÊN (ĐỒNG BỘ CORE & UI)
        // =====================================================================

        // =====================================================================
        // 6B. CỔ TRÙNG CỨU MỆNH THẬP TUYỆT THỂ (CHUẨN NGUYÊN TÁC)
        // =====================================================================

        /**
         * ☯ Âm Dương Chuyển Thân Cổ (Chuẩn nguyên tác Bạch Ngưng Băng):
         *  - Lần 1: Chuyển đổi Âm Dương nhục thân -> Phong ấn Thập Tuyệt Thể xuống Giáp Đẳng (90% Biển Nguyên),
         *    reset áp lực về 0% và NGỪNG HOÀN TOÀN tích tụ áp lực bạo tạc!
         *  - Lần 2: Đảo ngược Âm Dương -> Giải phong ấn, khôi phục 100% Thập Tuyệt Thể để chuẩn bị Phá Khiếu kết Siêu Cấp Phúc Địa!
         */
        applyYinYangRotationGu() {
            if (!this.isAwakened) {
                return { success: false, message: "Ngươi chưa Khai Khiếu, không thể thúc giục Âm Dương Chuyển Thân Cổ!" };
            }
            if (this.isImmortal) {
                return { success: false, message: "Ngươi đã thành tựu Tiên Khiếu, không còn chịu áp lực bạo tạc của Thập Tuyệt Thể ở Phàm Cảnh!" };
            }
            if (!this.aptitude || !this.aptitude.physique) {
                this.wallPressure = 5;
                return {
                    success: true,
                    message: "☯ Âm Dương Chuyển Thân Cổ phát quang chuyển đổi âm dương nhục thân! Áp lực Không Khiếu đã ổn định về 5%."
                };
            }

            if (!this.tenExtremeSealed) {
                this.tenExtremeSealed = true;
                this.aptitude.maxSeaPercent = 90;
                this.currentEssence = Math.min(90, this.currentEssence);
                this.wallPressure = 0;
                this.pressureFreezeTimer = 0;
                this._pressureWarned = false;
                return {
                    success: true,
                    sealed: true,
                    message: `☯ Âm Dương Chuyển Thân Cổ linh quang đại phóng! Âm dương đảo lộn giúp 【${this.aptitude.physique.name}】 tạm thời hạ xuống 90% Biển Nguyên (Giáp Đẳng Đỉnh Phong) — Áp lực Không Khiếu reset về 0% và NGỪNG TÍCH TỤ HOÀN TOÀN! (Dùng thêm 1 con nữa khi muốn khôi phục 100% Thập Tuyệt Thể để Thăng Tiên).`
                };
            } else {
                this.tenExtremeSealed = false;
                this.aptitude.maxSeaPercent = 100;
                this.currentEssence = 100;
                this.wallPressure = 0;
                this._pressureWarned = false;
                return {
                    success: true,
                    sealed: false,
                    message: `☯ Âm Dương Chuyển Thân Cổ tái chuyển hóa! Phong ấn được giải trừ, 【${this.aptitude.physique.name}】 khôi phục 100% Biển Nguyên viên mãn (Áp lực khởi động lại từ 0%)!`
                };
            }
        }

        /**
         * 🪨 Thạch Khiếu Cổ: Gia cố Khiếu Bích, xả ngay -50% áp lực mà vẫn giữ nguyên 100% Thập Tuyệt Thể
         */
        applyStoneApertureGu() {
            if (!this.isAwakened || this.isImmortal) {
                return { success: false, message: "Thạch Khiếu Cổ chỉ dùng để ổn định Phàm Khiếu (Nhất -> Ngũ Chuyển)!" };
            }
            const before = Number(this.wallPressure.toFixed(1));
            this.wallPressure = Math.max(0, Number((this.wallPressure - 50).toFixed(1)));
            if (this.wallPressure < 70) this._pressureWarned = false;
            return {
                success: true,
                message: `🪨 Thạch Khiếu Cổ hóa thạch gia cố Khiếu Bích! Áp lực Không Khiếu giảm mạnh từ ${before}% xuống còn ${this.wallPressure}% (vẫn giữ nguyên tư chất hiện tại).`
            };
        }

        /**
         * ⏳ Định Nguyên Tịnh Khiếu Cổ (Trụ Đạo): Giảm -25% áp lực & đóng băng hoàn toàn tốc độ tăng áp lực trong 300 giây (5 phút)
         */
        applyFreezePressureGu() {
            if (!this.isAwakened || this.isImmortal) {
                return { success: false, message: "Định Nguyên Tịnh Khiếu Cổ chỉ có tác dụng lên Phàm Khiếu!" };
            }
            const before = Number(this.wallPressure.toFixed(1));
            this.wallPressure = Math.max(0, Number((this.wallPressure - 25).toFixed(1)));
            this.pressureFreezeTimer = Math.max(this.pressureFreezeTimer || 0, 300);
            if (this.wallPressure < 70) this._pressureWarned = false;
            return {
                success: true,
                message: `⏳ Định Nguyên Tịnh Khiếu Cổ kích hoạt Trụ Đạo đạo ngân! Áp lực giảm từ ${before}% xuống ${this.wallPressure}% và ĐÓNG BĂNG hoàn toàn trong 300 giây (5 phút)!`
            };
        }

        isPseudoVenerable() {
            return Boolean(this.isImmortal && this.rank === 8 && this.subStage === 4);
        }

        /**
         * Kiểm tra 3 Điều Kiện Thành Tôn chuẩn nguyên tác (từ Á Tiên Tôn -> Cửu Chuyển Tôn Giả):
         *  1. Tích lũy >= 300.000 (30 vạn) Đạo Ngân trong lưu phái chính.
         *  2. Đã Đột Phá Phong Tỏa Thiên Đạo (cần vượt Ải 24 phá Túc Mệnh Cổ + Xung kích Phong Tỏa).
         *  3. Đã Độ Qua >= 3 lần Vạn Kiếp.
         */
        getVenerableReadiness(player, game) {
            const mainPath = (player && player.mainPath) ? player.mainPath : "Lực Đạo";
            const mainMarks = (player && player.daoMarks && player.daoMarks[mainPath]) ? Math.floor(player.daoMarks[mainPath]) : 0;
            const myriadPassed = (this.immortalAperture && this.immortalAperture.myriadTribulationsPassed) ? this.immortalAperture.myriadTribulationsPassed : 0;
            const fateDestroyed = game && typeof game.getStageClearCount === "function"
                ? game.getStageClearCount("stage_24") > 0
                : false;

            const isPseudo = this.isPseudoVenerable();
            const hasDaoMarks = mainMarks >= VENERABLE_REQ_DAO_MARKS;
            const hasBlockade = Boolean(this.daoBlockadeBroken);
            const hasMyriad = myriadPassed >= VENERABLE_REQ_MYRIAD_TRIBULATIONS;

            return {
                isPseudoVenerable: isPseudo,
                isAlreadyVenerable: this.isImmortal && this.rank >= 9,
                mainPath: mainPath,
                mainMarks: mainMarks,
                reqMarks: VENERABLE_REQ_DAO_MARKS,
                hasDaoMarks: hasDaoMarks,
                fateDestroyed: fateDestroyed,
                hasBlockade: hasBlockade,
                myriadPassed: myriadPassed,
                reqMyriad: VENERABLE_REQ_MYRIAD_TRIBULATIONS,
                hasMyriad: hasMyriad,
                canBreakBlockade: isPseudo && !hasBlockade && fateDestroyed,
                canAscendVenerable: isPseudo && hasDaoMarks && hasBlockade && hasMyriad
            };
        }

        /**
         * Xung kích Đột Phá Phong Tỏa Thiên Đạo (Điều kiện bắt buộc để Thành Tôn)
         */
        attemptBreakDaoBlockade(player, game) {
            if (!this.isPseudoVenerable()) {
                return { success: false, message: "Chỉ cường giả đạt cảnh giới 【Á Tiên Tôn】 mới đủ tư cách xung kích Phong Tỏa Thiên Đạo!" };
            }
            if (this.daoBlockadeBroken) {
                return { success: false, message: "Ngươi đã đột phá Phong Tỏa Thiên Đạo rồi!" };
            }
            const fateDestroyed = game && typeof game.getStageClearCount === "function"
                ? game.getStageClearCount("stage_24") > 0
                : false;
            if (!fateDestroyed) {
                return {
                    success: false,
                    message: "Túc Mệnh Cổ tại Thiên Đình vẫn còn tồn tại! Hãy vượt qua 【Ải 24: Thiên Đình Trung Châu — Túc Mệnh Đại Chiến】 để phá hủy Túc Mệnh Cổ trước khi đột phá Phong Tỏa Thiên Đạo!"
                };
            }

            const essenceReq = 60;
            const qiReq = 250;
            const mentalReq = 160;
            const curEss = this.immortalEssence[8] || 0;

            if (curEss < essenceReq) {
                return { success: false, message: `Không đủ Bạch Lệ Tiên Nguyên (Cần ${essenceReq} viên, hiện có ${curEss.toFixed(1)} viên)!` };
            }
            if (this.humanQi < qiReq) {
                return { success: false, message: `Nhân Khí chưa đủ hùng hậu để phá vỡ xiềng xích Thiên Đạo (Cần ${qiReq}, hiện có ${Math.floor(this.humanQi)})!` };
            }
            if (player && player.mental < mentalReq) {
                return { success: false, message: `Tinh Thần Lực không đủ (${Math.floor(player.mental)}/${mentalReq})!` };
            }
            if (player && player.hp < Math.round(player.maxHp * 0.65)) {
                return { success: false, message: "Sinh Mệnh phải đạt trên 65% mới chịu nổi phản phệ của Thiên Đạo!" };
            }

            this.immortalEssence[8] = Math.max(0, curEss - essenceReq);
            this.humanQi = Math.max(0, this.humanQi - qiReq);
            if (player) {
                player.mental = Math.max(0, player.mental - mentalReq);
                player.hp = Math.max(1, player.hp - Math.round(player.maxHp * 0.55));
            }

            this.daoBlockadeBroken = true;
            return {
                success: true,
                message: "🌌 OANH!! Đạo ngân bản mệnh va chạm trực diện với ý chí trời đất — NGƯƠI ĐÃ ĐỘT PHÁ THÀNH CÔNG PHONG TỎA THIÊN ĐẠO! Con đường chứng đạo Cửu Chuyển Tôn Giả đã mở toang!"
            };
        }

        /**
         * Chính thức Chứng Đạo Thành Tôn (Á Tiên Tôn -> Cửu Chuyển Tôn Giả & Đạo Chủ Lưu Phái)
         */
        attemptAscendToVenerable(player, game) {
            const check = this.getVenerableReadiness(player, game);
            if (check.isAlreadyVenerable) {
                return { success: false, message: "Ngươi đã là Cửu Chuyển Tôn Giả đứng trên đỉnh thiên địa!" };
            }
            if (!check.isPseudoVenerable) {
                return { success: false, message: "Cần đột phá lên cảnh giới 【Á Tiên Tôn】 trước khi chứng đạo Thành Tôn!" };
            }
            if (!check.hasDaoMarks) {
                return {
                    success: false,
                    message: `Chưa đủ 30 Vạn Đạo Ngân! Lưu phái 【${check.mainPath}】 hiện mới đạt ${check.mainMarks.toLocaleString("vi-VN")} / 300.000 Đạo Ngân.`
                };
            }
            if (!check.hasBlockade) {
                return {
                    success: false,
                    message: "Chưa Đột Phá Phong Tỏa Thiên Đạo! Hãy hoàn thành Ải 24 (phá Túc Mệnh Cổ) rồi bấm nút 'Xung Kích Đột Phá Phong Tỏa Thiên Đạo'."
                };
            }
            if (!check.hasMyriad) {
                return {
                    success: false,
                    message: `Chưa vượt qua đủ 3 lần Vạn Kiếp! Hiện mới độ qua ${check.myriadPassed} / 3 lần Vạn Kiếp.`
                };
            }

            this.rank = 9;
            this.subStage = 0;
            this.daoLordPath = check.mainPath;
            this.naturalDaoMarksRefined = 50000;
            this.immortalAperture.gradeName = "Chí Tôn Tiên Khiếu Động Thiên";
            this.immortalAperture.spaceAcres += 25000;
            this.immortalAperture.subStageTribulationsPassed = 0;
            this.immortalAperture.subStageTribulationsRequired = this.getManualTribulationRequirements().tribulationsNeededForNextStage;
            this.wallProgress = 0;
            this.maxWallProgress = this.immortalAperture.subStageTribulationsRequired;
            this.immortalEssence[9] = Math.max(15, (this.immortalEssence[9] || 0) + 15);

            if (player && typeof player.recalculateStats === "function") {
                player.recalculateStats();
                player.hp = player.maxHp;
                player.mental = player.maxMental;
            }

            return {
                success: true,
                daoLordPath: this.daoLordPath,
                message: `👑 [CHỨNG ĐẠO THÀNH TÔN — ĐỘC BÁ VẠN CỔ] Ngũ Vực chấn động, Lưỡng Thiên rung chuyển! Ngươi chính thức tấn thăng 【Cửu Chuyển Tôn Giả】, trở thành 【${this.daoLordPath} ĐẠO CHỦ】 (khởi đầu luyện hóa 50.000 Đạo Ngân tự nhiên, +15 viên Hoàng Hạnh Tiên Nguyên, giảm 30% tiêu hao Tiên Nguyên & khuếch đại cực hạn toàn bộ cổ thuật ${this.daoLordPath})!`
            };
        }

        /**
         * Quyền Năng Đạo Chủ (chỉ sau khi thành Tôn): Luyện hóa Đạo Ngân Tự Nhiên của lưu phái mình theo
         */
        refineNaturalDaoMarks(player) {
            if (!this.isImmortal || this.rank < 9 || !this.daoLordPath) {
                return { success: false, message: "Chỉ Cửu Chuyển Tôn Giả đã trở thành Đạo Chủ mới có thể Luyện Hóa Đạo Ngân Tự Nhiên!" };
            }
            const essCost = 8;
            const mentalCost = 50;
            const curEss = this.immortalEssence[9] || 0;
            if (curEss < essCost) {
                return { success: false, message: `Cần ${essCost} viên Hoàng Hạnh Tiên Nguyên để luyện hóa Đạo Ngân Tự Nhiên (Hiện có: ${curEss.toFixed(1)} viên)!` };
            }
            if (player && player.mental < mentalCost) {
                return { success: false, message: `Cần ${mentalCost} Tinh Thần Lực để dẫn động Đạo Ngân Thiên Địa!` };
            }

            this.immortalEssence[9] = Math.max(0, curEss - essCost);
            if (player) {
                player.mental = Math.max(0, player.mental - mentalCost);
                player.addDaoMarks(this.daoLordPath, 15000);
            }
            this.naturalDaoMarksRefined = (this.naturalDaoMarksRefined || 0) + 25000;

            return {
                success: true,
                message: `👑 [Quyền Năng ${this.daoLordPath} Đạo Chủ] Ngươi luyện hóa thêm +25.000 Đạo Ngân Tự Nhiên (Tổng: ${this.naturalDaoMarksRefined.toLocaleString("vi-VN")}) và +15.000 Đạo Ngân bản thân! Uy áp ${this.daoLordPath} bao trùm Ngũ Vực!`
            };
        }

        /**
         * Kiểm tra đồng bộ toàn bộ điều kiện Phá Khiếu Thăng Tiên cho cả Core Logic và UIManager
         */
        getAscensionReadiness() {
            const minHumanQi = MIN_ASCENSION_HUMAN_QI;
            const isPeakRank5 = this.rank >= 5 && this.subStage >= 3;
            const isWallFull = this.wallProgress >= this.maxWallProgress;
            const hasEnoughQi = this.humanQi >= minHumanQi;

            return {
                canAscend: !this.isImmortal && isPeakRank5 && isWallFull && hasEnoughQi,
                isPeakRank5: isPeakRank5,
                isWallFull: isWallFull,
                hasEnoughQi: hasEnoughQi,
                minHumanQi: minHumanQi,
                currentHumanQi: Math.floor(this.humanQi),
                wallProgress: Math.floor(this.wallProgress),
                maxWallProgress: this.maxWallProgress
            };
        }

        startImmortalAscension(environmentQi = { heaven: 150, earth: 150 }) {
            if (this.isImmortal) {
                return { success: false, message: "Ngươi đã là Cổ Tiên!" };
            }

            const readiness = this.getAscensionReadiness();

            if (!readiness.isPeakRank5) {
                return {
                    success: false,
                    message: `Chỉ Cổ Sư đạt Ngũ Chuyển Đỉnh Phong mới đủ tư cách Phá Khiếu Thăng Tiên (Hiện tại: ${this.getRealmDisplayName()})!`
                };
            }

            // Bắt buộc phải ôn dưỡng đầy 100% Tinh Mạc của Ngũ Chuyển Đỉnh Phong
            if (!readiness.isWallFull) {
                return {
                    success: false,
                    message: `Khiếu Bích Tinh Mạc Ngũ Chuyển Đỉnh Phong chưa đạt viên mãn (${readiness.wallProgress}/${readiness.maxWallProgress})! Chưa thể đập vỡ Khiếu Bích.`
                };
            }

            if (!readiness.hasEnoughQi) {
                return {
                    success: false,
                    message: `Nhân Khí tích lũy chưa đủ sâu dày (${readiness.currentHumanQi}/${readiness.minHumanQi})! Hãy vượt thêm Bản Đồ Lịch Luyện hoặc thăm dò Mộng Cảnh.`
                };
            }

            const committedHumanQi = Math.max(MIN_ASCENSION_HUMAN_QI, Math.floor(this.humanQi));
            const baseHeavenQi = Math.round(committedHumanQi * 0.96);
            const baseEarthQi = Math.round(committedHumanQi * 0.98);
            const initialBalance = Math.min(99, Math.round(78 + Math.min(20, (committedHumanQi - MIN_ASCENSION_HUMAN_QI) * 0.10)));

            this.ascensionState = {
                inProgress: true,
                stage: 1,
                heavenQi: baseHeavenQi || environmentQi.heaven || 150,
                earthQi: baseEarthQi || environmentQi.earth || 150,
                humanQiCommitted: committedHumanQi,
                balanceScore: initialBalance,
                tribulationHp: 100,
                tribulationMaxHp: 100,
                logs: [
                    `🌌 [Giai đoạn 1/4 - Phá Khiếu] Ngươi dốc toàn bộ Tử Tinh Chân Nguyên đập nát Tinh Mạc Khiếu Bích! Bước đường thành Tiên chính thức bắt đầu (Độ cân bằng Tam Khí: ${initialBalance}%). Hãy bấm tiếp nút Thăng Tiên để dẫn động Thiên Địa Nhị Khí!`
                ]
            };

            return {
                success: true,
                ascensionState: this.ascensionState,
                message: this.ascensionState.logs[0]
            };
        }

        adjustThreeQi(actionType = "stabilize") {
            if (!this.ascensionState.inProgress) {
                return { success: false, message: "Hiện chưa bắt đầu quá trình Thăng Tiên." };
            }

            if (actionType === "absorb_heaven") {
                this.ascensionState.heavenQi += 15;
                this.ascensionState.balanceScore = Math.min(100, this.ascensionState.balanceScore + 4);
            } else if (actionType === "absorb_earth") {
                this.ascensionState.earthQi += 15;
                this.ascensionState.balanceScore = Math.min(100, this.ascensionState.balanceScore + 4);
            } else if (actionType === "burn_human_qi") {
                if (this.humanQi >= 10) {
                    this.humanQi -= 10;
                    this.ascensionState.humanQiCommitted += 20;
                    this.ascensionState.balanceScore = Math.min(100, this.ascensionState.balanceScore + 8);
                }
            } else if (actionType === "stabilize") {
                this.ascensionState.balanceScore = Math.min(100, Math.max(82, this.ascensionState.balanceScore + 6));
            }

            return {
                success: true,
                balanceScore: this.ascensionState.balanceScore,
                ascensionState: this.ascensionState
            };
        }

        advanceAscensionStage(player) {
            if (!this.ascensionState.inProgress) {
                return this.startImmortalAscension();
            }

            const st = this.ascensionState;

            if (st.stage === 1) {
                st.stage = 2;
                this.currentEssence = 0;
                this.adjustThreeQi("stabilize");
                st.logs.push(
                    `🌩️ [Giai đoạn 2/4 - Tam Khí Hội Tụ] Thiên Khí từ chín tầng trời giáng xuống, Địa Khí từ lòng đất trào dâng hòa cùng ${st.humanQiCommitted} điểm Nhân Khí của ngươi thành kén khí khổng lồ! Hãy bấm tiếp để nghênh đón Thiên Kiếp Địa Tai!`
                );
                return { success: true, stage: 2, state: st };
            }

            if (st.stage === 2) {
                st.stage = 3;
                st.logs.push(
                    `⚡ [Giai đoạn 3/4 - Độ Lôi Kiếp] Lôi kiếp vạn trượng giáng xuống khảo nghiệm đạo cơ! Nhờ nền tảng Nhân Khí hùng hậu (Độ dung hợp: ${st.balanceScore}%), ngươi hiên ngang đánh tan kiếp vân! Bấm lần cuối để Nổ Khiếu Hóa Phúc Địa!`
                );
                return { success: true, stage: 3, state: st };
            }

            if (st.stage >= 3) {
                st.stage = 4;
                this._completeImmortalApertureFormation();
                st.inProgress = false;

                const successMsg = `🎉 [Đắc Đạo Thành Tiên] Tam Khí nổ tung khai thiên lập địa, hóa thành 【${this.immortalAperture.gradeName} (${this.immortalAperture.spaceAcres} mẫu)】! Chúc mừng đạo hữu chính thức tấn thăng 【${this.getRealmDisplayName()}】, sở hữu Lục Đề Tiên Nguyên!`;
                st.logs.push(successMsg);

                if (player) {
                    if (typeof player.grantInitialImmortalDaoMarks === "function") {
                        player.grantInitialImmortalDaoMarks();
                    }
                    if (typeof player.addDaoMarksFromTribulation === "function") {
                        player.addDaoMarksFromTribulation(120);
                    }
                }

                return {
                    success: true,
                    stage: 4,
                    completed: true,
                    blessedLandGrade: this.immortalAperture.gradeName,
                    state: st
                };
            }

            return { success: true, state: st };
        }

        _completeImmortalApertureFormation() {
            const isTrueTenExtremeUnsealed = Boolean(this.aptitude.physique && !this.tenExtremeSealed);
            this.isImmortal = true;
            this.rank = 6;
            this.subStage = 0; // Lục Chuyển Sơ Giai
            this.wallPressure = 0;
            this.hasExploded = false;
            this._pressureWarned = false;
            this.pressureFreezeTimer = 0;

            let gradeKey = "MEDIUM";
            const totalQi = this.ascensionState.heavenQi + this.ascensionState.earthQi + this.ascensionState.humanQiCommitted;

            if (isTrueTenExtremeUnsealed || totalQi >= 580 || this.humanQi >= 220) {
                gradeKey = "SUPER";
            } else if (totalQi >= 420 || this.humanQi >= 165) {
                gradeKey = "LARGE";
            } else if (totalQi >= 300) {
                gradeKey = "MEDIUM";
            } else {
                gradeKey = "SMALL";
            }

            const cfg = BLESSED_LAND_GRADES[gradeKey];
            const acres = Math.floor(cfg.minSpaceAcres + Math.random() * (cfg.maxSpaceAcres - cfg.minSpaceAcres));

            // Trừ lượng Nhân Khí đã tiêu hao khi kết thành Phúc Địa
            this.humanQi = Math.max(10, Math.floor(this.humanQi - MIN_ASCENSION_HUMAN_QI));

            // Lục Đề Tiên Nguyên khởi đầu vừa phải
            this.immortalEssence[6] = Math.max(6, Math.round(cfg.essenceBeadPerYear * 0.35));

            const firstReq = MORTAL_SUBSTAGES[0].immortalTribulationsReq; // 4 Tai Kiếp để lên Trung Giai
            this.wallProgress = 0;
            this.maxWallProgress = firstReq;

            this.immortalAperture = {
                active: true,
                gradeId: gradeKey,
                gradeName: cfg.name,
                spaceAcres: acres,
                timeRatio: cfg.timeRatio,
                internalDays: 1,
                calamityCountdownDays: 1200,
                lastYieldAt: 0,
                subStageTribulationsPassed: 0,
                subStageTribulationsRequired: firstReq,
                earthlyCalamitiesPassed: 1,
                heavenlyTribulationsPassed: 1,
                grandTribulationsPassed: 0,
                myriadTribulationsPassed: 0,
                originCoreStability: 100,
                resources: {
                    primevalStonesOutput: Math.max(4, Math.round(acres / 350)),
                    herbsNodes: Math.max(2, Math.round(acres / 1400)),
                    oreVeins: Math.max(1, Math.round(acres / 2000)),
                    guWormsWild: Math.max(4, Math.round(acres / 900)),
                    immortalMaterialPoints: gradeKey === "SUPER" ? 4 : 2
                },
                livingBeings: {
                    mortals: gradeKey === "SUPER" ? 500 : 120,
                    beasts: 35,
                    variantHumans: 0
                },
                environmentNodes: this._generateInitialApertureNodes(acres)
            };
        }

        _generateInitialApertureNodes(acres) {
            const count = Math.min(10, Math.max(5, Math.floor(acres / 1400)));
            const types = [
                { name: "Mỏ Nguyên Thạch", color: "#4cd964", icon: "💎" },
                { name: "Vườn Linh Thảo", color: "#5cc995", icon: "🌿" },
                { name: "Đàn Hoang Thú", color: "#e08e45", icon: "🐺" },
                { name: "Mạch Đạo Ngân", color: "#b75cff", icon: "☯" },
                { name: "Suối Linh Tuyền", color: "#5aa9e6", icon: "💧" }
            ];
            const nodes = [];
            for (let i = 0; i < count; i++) {
                const t = types[i % types.length];
                nodes.push({
                    id: `node_${i}`,
                    name: t.name,
                    color: t.color,
                    icon: t.icon,
                    normX: 0.16 + ((i % 5) * 0.17) + (Math.random() - 0.5) * 0.04,
                    normY: i < 5 ? 0.52 : 0.78,
                    level: 1
                });
            }
            return nodes;
        }

        /**
         * Chi phí và số lần Độ Tai Kiếp cần thiết ở từng tiểu cảnh giới Cổ Tiên (Lâu hơn & chuẩn nguyên tác)
         */
        getApertureYieldCooldownRemaining() {
            if (!this.isImmortal || !this.immortalAperture) return 0;
            const last = this.immortalAperture.lastYieldAt || 0;
            const elapsedSec = (Date.now() - last) / 1000;
            return Math.max(0, Math.ceil(180 - elapsedSec));
        }

        /**
         * Thu hoạch sản vật Phúc Địa / Động Thiên (Có thời gian hồi 3 phút = 180 giây để tránh spam tăng cấp quá nhanh)
         */
        collectApertureYield(player) {
            if (!this.isImmortal || !this.immortalAperture.active) {
                return { success: false, message: "Chỉ Cổ Tiên Lục Chuyển trở lên mới sở hữu Phúc Địa để thu hoạch sản vật!" };
            }
            const cdRem = this.getApertureYieldCooldownRemaining();
            if (cdRem > 0) {
                const m = Math.floor(cdRem / 60);
                const s = String(cdRem % 60).padStart(2, "0");
                return {
                    success: false,
                    cooldownRemaining: cdRem,
                    message: `⏳ Phúc Địa đang tái sinh nguyên khí! Cần chờ thêm ${m}:${s} nữa mới có thể thu hoạch đợt kế tiếp.`
                };
            }

            this.immortalAperture.lastYieldAt = Date.now();
            const stonesYield = Math.max(8, Math.round((this.immortalAperture.resources.primevalStonesOutput || 5) * 1.2));
            const essenceYield = 0.5;
            if (player) {
                player.primevalStones += stonesYield;
                player.addItem("spirit_herb", 1);
                player.addItem("moon_orchid", 1);
            }
            this.immortalEssence[this.rank] = Number(((this.immortalEssence[this.rank] || 0) + essenceYield).toFixed(2));

            return {
                success: true,
                message: `🌱 Đã thu hoạch sản vật trong ${this.immortalAperture.gradeName}: +${stonesYield} Nguyên Thạch, +1 Thanh Linh Thảo, +1 Nguyệt Lan Hoa & +${essenceYield} viên Tiên Nguyên! (Hồi thu hoạch: 3 phút)`
            };
        }

        getManualTribulationRequirements() {
            // Riêng Á Tiên Tôn (Bát Chuyển Cực Hạn): Độ Vạn Kiếp (Myriad Tribulation)
            if (this.isPseudoVenerable()) {
                return {
                    isMyriadTribulation: true,
                    tribulationName: "Vạn Kiếp (Myriad Tribulation)",
                    essenceCost: 65,
                    humanQiCost: 260,
                    mentalCost: 165,
                    hpDamagePct: 0.65,
                    tribulationsNeededForNextStage: VENERABLE_REQ_MYRIAD_TRIBULATIONS
                };
            }

            const rankOffset = Math.max(0, this.rank - 6);
            const subReq = MORTAL_SUBSTAGES[this.subStage]
                ? MORTAL_SUBSTAGES[this.subStage].immortalTribulationsReq
                : 14;

            const nameByRank = {
                6: this.subStage < 2 ? "Địa Tai" : "Thiên Kiếp",
                7: this.subStage < 2 ? "Thiên Kiếp" : "Hạo Kiếp",
                8: "Hạo Kiếp",
                9: "Hỗn Độn Kiếp"
            };

            return {
                isMyriadTribulation: false,
                tribulationName: nameByRank[this.rank] || "Tai Kiếp",
                essenceCost: 14 + rankOffset * 12 + this.subStage * 6,
                humanQiCost: 65 + rankOffset * 40 + this.subStage * 20,
                mentalCost: 70 + rankOffset * 20 + this.subStage * 8,
                hpDamagePct: 0.50,
                tribulationsNeededForNextStage: subReq + rankOffset * 6
            };
        }

        _triggerApertureCalamity(player, isManual = true) {
            if (!this.isImmortal) {
                return { success: false, message: "Phàm nhân chưa có Tiên Khiếu để độ Tai Kiếp!" };
            }

            if (this.rank === 9 && this.subStage === 3) {
                return {
                    success: false,
                    message: "Ngươi đã đứng trên đỉnh cao nhất vạn cổ 【Cửu Chuyển Đỉnh Phong — Vô Địch Thiên Hạ】!"
                };
            }

            const isPseudo = this.isPseudoVenerable();
            const req = this.getManualTribulationRequirements();
            const currentEssenceBeads = this.immortalEssence[this.rank] || 0;
            const essenceName = IMMORTAL_RANKS[this.rank].essenceName;

            // Tai kiếp tự nhiên mỗi 600 ngày ở Á Tiên Tôn chỉ là Hạo Kiếp bổ trợ Đạo Ngân, KHÔNG thay thế Vạn Kiếp chủ động
            if (!isManual && isPseudo) {
                this.immortalAperture.calamityCountdownDays = 1200;
                this.immortalAperture.grandTribulationsPassed = (this.immortalAperture.grandTribulationsPassed || 0) + 1;
                const naturalDaoGain = 6000;
                this.immortalAperture.spaceAcres += 350;
                if (player) {
                    player.hp = Math.max(1, player.hp - Math.round(player.maxHp * 0.18));
                    if (typeof player.addDaoMarksFromTribulation === "function") {
                        player.addDaoMarksFromTribulation(naturalDaoGain, 0.85);
                    }
                }
                return {
                    success: true,
                    isManual: false,
                    didAdvance: false,
                    newRealmName: this.getRealmDisplayName(),
                    message: `🌩️ [Hạo Kiếp Định Kỳ 1200 Ngày — Á Tiên Tôn] Động Thiên vượt qua 1 đợt Hạo Kiếp tự nhiên (+350 mẫu, +${naturalDaoGain.toLocaleString("vi-VN")} Đạo Ngân)! Hãy chủ động Độ Vạn Kiếp (3 lần) để chuẩn bị Thành Tôn.`
                };
            }

            if (isManual) {
                if (currentEssenceBeads < req.essenceCost) {
                    return {
                        success: false,
                        message: `Không đủ ${essenceName}! Cần tối thiểu ${req.essenceCost} viên (Hiện có: ${currentEssenceBeads.toFixed(1)} viên). Hãy dùng Tiên Nguyên Thạch hoặc chờ Phúc Địa sản sinh.`
                    };
                }

                if (this.humanQi < req.humanQiCost) {
                    return {
                        success: false,
                        message: `Nhân Khí không đủ để dẫn động ${req.tribulationName} (Cần ${req.humanQiCost} Nhân Khí, hiện có: ${Math.floor(this.humanQi)})! Hãy vượt các Bản Đồ hoặc thăm dò Mộng Cảnh.`
                    };
                }

                if (player) {
                    if (player.mental < req.mentalCost) {
                        return {
                            success: false,
                            message: `Tinh Thần Lực quá suy yếu (${Math.floor(player.mental)}/${req.mentalCost})! Độ ${req.tribulationName} lúc này sẽ tan hồn phách.`
                        };
                    }
                    const minHpNeeded = Math.round(player.maxHp * (req.hpDamagePct + 0.08));
                    if (player.hp < minHpNeeded) {
                        return {
                            success: false,
                            message: `Sinh Mệnh quá thấp (${Math.ceil(player.hp)}/${minHpNeeded})! Không đủ sức chống đỡ ${req.tribulationName} oanh kích.`
                        };
                    }
                }

                this.immortalEssence[this.rank] = Math.max(0, currentEssenceBeads - req.essenceCost);
                this.humanQi = Math.max(0, this.humanQi - req.humanQiCost);
                if (player) {
                    player.mental = Math.max(0, player.mental - req.mentalCost);
                    const tribDamage = Math.round(player.maxHp * req.hpDamagePct);
                    player.hp = Math.max(1, player.hp - tribDamage);
                }
            } else if (player) {
                const naturalDamage = Math.round(player.maxHp * 0.16);
                player.hp = Math.max(1, player.hp - naturalDamage);
            }

            this.immortalAperture.calamityCountdownDays = 1200;

            // --- NHÁNH RIÊNG CHO Á TIÊN TÔN: ĐỘ VẠN KIẾP (MYRIAD TRIBULATION) ---
            if (isPseudo && isManual) {
                this.immortalAperture.myriadTribulationsPassed = (this.immortalAperture.myriadTribulationsPassed || 0) + 1;
                this.immortalAperture.grandTribulationsPassed = (this.immortalAperture.grandTribulationsPassed || 0) + 1;
                const acreGain = 1200;
                const daoMarkGain = 35000;
                this.immortalAperture.spaceAcres += acreGain;

                if (player && typeof player.addDaoMarksFromTribulation === "function") {
                    player.addDaoMarksFromTribulation(daoMarkGain, 0.85);
                }

                const mCount = this.immortalAperture.myriadTribulationsPassed;
                this.wallProgress = Math.min(VENERABLE_REQ_MYRIAD_TRIBULATIONS, mCount);
                this.maxWallProgress = VENERABLE_REQ_MYRIAD_TRIBULATIONS;

                if (player && typeof player.recalculateStats === "function") {
                    player.recalculateStats();
                }

                const readyNote = mCount >= VENERABLE_REQ_MYRIAD_TRIBULATIONS
                    ? "🎉 ĐÃ HOÀN THÀNH ĐỦ 3 LẦN VẠN KIẾP! Hãy kiểm tra 30 Vạn Đạo Ngân & Đột Phá Phong Tỏa Thiên Đạo để chính thức Thành Tôn!"
                    : `Tiến độ Vạn Kiếp Thành Tôn: ${mCount}/${VENERABLE_REQ_MYRIAD_TRIBULATIONS} lần.`;

                return {
                    success: true,
                    isManual: true,
                    isMyriad: true,
                    didAdvance: mCount === VENERABLE_REQ_MYRIAD_TRIBULATIONS,
                    newRealmName: this.getRealmDisplayName(),
                    message: `🌩️ [ĐỘ VẠN KIẾP THÀNH CÔNG — LẦN ${mCount}] Ngươi vượt qua Vạn Kiếp hủy thiên diệt địa (+${acreGain} mẫu Động Thiên, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! ${readyNote}`
                };
            }

            // --- NHÁNH LỤC / THẤT / BÁT CHUYỂN (SƠ -> ĐỈNH PHONG) & CỬU CHUYỂN ---
            this.immortalAperture.earthlyCalamitiesPassed += 1;
            this.immortalAperture.heavenlyTribulationsPassed += 1;
            if (this.rank >= 8) {
                this.immortalAperture.grandTribulationsPassed = (this.immortalAperture.grandTribulationsPassed || 0) + 1;
            }

            this.immortalAperture.subStageTribulationsRequired = req.tribulationsNeededForNextStage;
            this.immortalAperture.subStageTribulationsPassed = (this.immortalAperture.subStageTribulationsPassed || 0) + 1;

            // Mức tăng Đạo Ngân chuẩn nguyên tác hướng tới 30 vạn Đạo Ngân ở Á Tiên Tôn
            const daoGainByRank = {
                6: 450,
                7: 1800,
                8: 5500,
                9: 18000
            };
            const acreGain = 110 * (this.rank - 5);
            const daoMarkGain = daoGainByRank[this.rank] || 650;
            this.immortalAperture.spaceAcres += acreGain;

            if (player && typeof player.addDaoMarksFromTribulation === "function") {
                player.addDaoMarksFromTribulation(daoMarkGain, 0.80);
            }

            let breakthroughMsg = "";
            let didAdvance = false;

            if (this.immortalAperture.subStageTribulationsPassed >= this.immortalAperture.subStageTribulationsRequired) {
                didAdvance = true;
                this.immortalAperture.subStageTribulationsPassed = 0;

                if (this.subStage < 3) {
                    this.subStage += 1;
                    this.immortalEssence[this.rank] += 3;
                    breakthroughMsg = `🎉 Đạo cơ viên mãn, tu vi đột phá lên 【${this.getRealmDisplayName()}】 (+3 viên ${IMMORTAL_RANKS[this.rank].essenceName})!`;
                } else if (this.rank === 8 && this.subStage === 3) {
                    // Bát Chuyển Đỉnh Phong -> Đột phá lên Á TIÊN TÔN (KHÔNG nhảy thẳng lên Cửu Chuyển!)
                    this.subStage = 4;
                    this.immortalAperture.gradeName = "Thái Cổ Động Thiên (Á Tiên Tôn)";
                    this.immortalEssence[8] = (this.immortalEssence[8] || 0) + 15;
                    breakthroughMsg = `🌟 Đột phá giới hạn Bát Chuyển Đỉnh Phong, bước vào cảnh giới 【Á TIÊN TÔN】! Để chứng đạo Cửu Chuyển Tôn Giả & trở thành Đạo Chủ, ngươi cần: (1) Tích lũy 300.000 Đạo Ngân lưu phái chính, (2) Đột phá Phong Tỏa Thiên Đạo, (3) Độ qua 3 lần Vạn Kiếp!`;
                } else if (this.rank < 8) {
                    this.rank += 1;
                    this.subStage = 0;
                    this.immortalEssence[this.rank] = Math.max(8, (this.immortalEssence[this.rank] || 0) + 8);
                    if (this.rank === 8) {
                        this.immortalAperture.gradeName = "Thái Cổ Động Thiên";
                    }
                    breakthroughMsg = `🌟 Vượt qua Đại Kiếp sinh tử, chính thức bước vào đại cảnh giới mới 【${this.getRealmDisplayName()}】, sở hữu ${IMMORTAL_RANKS[this.rank].essenceName}!`;
                }

                const nextReq = this.getManualTribulationRequirements().tribulationsNeededForNextStage;
                this.immortalAperture.subStageTribulationsRequired = nextReq;
            }

            if (this.isPseudoVenerable()) {
                this.wallProgress = Math.min(VENERABLE_REQ_MYRIAD_TRIBULATIONS, this.immortalAperture.myriadTribulationsPassed || 0);
                this.maxWallProgress = VENERABLE_REQ_MYRIAD_TRIBULATIONS;
            } else {
                this.wallProgress = this.immortalAperture.subStageTribulationsPassed;
                this.maxWallProgress = this.immortalAperture.subStageTribulationsRequired;
            }

            if (player && typeof player.recalculateStats === "function") {
                player.recalculateStats();
            }

            const progressStr = this.isPseudoVenerable()
                ? `(Vạn Kiếp: ${this.immortalAperture.myriadTribulationsPassed || 0}/${VENERABLE_REQ_MYRIAD_TRIBULATIONS})`
                : `(${this.immortalAperture.subStageTribulationsPassed}/${this.immortalAperture.subStageTribulationsRequired} ${req.tribulationName} để lên tiểu cảnh giới kế tiếp)`;
            const prefixLabel = isManual ? `⚡ [Chủ Động Độ ${req.tribulationName}]` : `🌩️ [${req.tribulationName} Định Kỳ 1200 Ngày]`;

            return {
                success: true,
                isManual: isManual,
                didAdvance: didAdvance,
                newRealmName: this.getRealmDisplayName(),
                message: didAdvance
                    ? `${prefixLabel} Thành công (+${acreGain} mẫu Tiên Khiếu, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! ${breakthroughMsg}`
                    : `${prefixLabel} Vượt qua 1 đợt ${req.tribulationName} (+${acreGain} mẫu Tiên Khiếu, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! Tiến độ tu vi: 【${this.getRealmDisplayName()}】 ${progressStr}.`
            };
        }

        /**
         * Xử phạt trừ tu vi khi Cổ Sư bị hết máu và tử vong trong chiến đấu (không phải bạo tạc Thập Tuyệt Thể)
         */
        applyDeathCultivationPenalty(player) {
            const details = [];
            let droppedSubStage = false;

            if (!this.isImmortal) {
                const wallLoss = Math.max(20, Math.round(this.maxWallProgress * 0.30));
                if (this.wallProgress < Math.round(this.maxWallProgress * 0.15) && this.subStage > 0) {
                    const oldRealm = this.getRealmDisplayName();
                    this.subStage -= 1;
                    droppedSubStage = true;
                    const rankCfg = MORTAL_RANKS[this.rank] || MORTAL_RANKS[1];
                    const subCfg = MORTAL_SUBSTAGES[this.subStage] || MORTAL_SUBSTAGES[0];
                    this.maxWallProgress = Math.round(rankCfg.baseWallReq * subCfg.statMult);
                    this.wallProgress = Math.round(this.maxWallProgress * 0.65);
                    details.push(`Đạo cơ chấn động, rớt 1 tiểu cảnh giới từ 【${oldRealm}】 xuống 【${this.getRealmDisplayName()}】!`);
                } else {
                    const before = Math.floor(this.wallProgress);
                    this.wallProgress = Math.max(0, Math.floor(this.wallProgress - wallLoss));
                    const actualLoss = before - this.wallProgress;
                    details.push(`Tổn thất -${actualLoss} điểm Ôn Dưỡng Khiếu Bích (còn ${this.wallProgress}/${this.maxWallProgress}).`);
                }

                const qiLoss = Math.min(Math.floor(this.humanQi), Math.max(1, Math.round(this.humanQi * 0.08)));
                this.humanQi = Math.max(0, Number((this.humanQi - qiLoss).toFixed(1)));
                if (qiLoss > 0) details.push(`Tán mất -${qiLoss} Nhân Khí.`);
            } else {
                if (!this.isPseudoVenerable() && (this.immortalAperture.subStageTribulationsPassed || 0) > 0) {
                    this.immortalAperture.subStageTribulationsPassed = Math.max(0, this.immortalAperture.subStageTribulationsPassed - 1);
                    this.wallProgress = this.immortalAperture.subStageTribulationsPassed;
                    details.push(`Tiên Khiếu chấn động, tổn thất -1 tiến độ Độ Tai Kiếp (còn ${this.wallProgress}/${this.maxWallProgress}).`);
                } else if (player && player.mainPath) {
                    const baseMarkLoss = this.rank >= 8 ? 1500 : (this.rank === 7 ? 450 : 120);
                    const lostMarks = Math.min(player.daoMarks[player.mainPath] || 0, baseMarkLoss);
                    if (lostMarks > 0) {
                        player.addDaoMarks(player.mainPath, -lostMarks);
                        details.push(`Tổn thất -${lostMarks.toLocaleString("vi-VN")} Đạo Ngân ${player.mainPath}.`);
                    }
                }

                const qiLoss = Math.min(Math.floor(this.humanQi), Math.max(3, Math.round(this.humanQi * 0.10)));
                this.humanQi = Math.max(0, Number((this.humanQi - qiLoss).toFixed(1)));
                if (qiLoss > 0) details.push(`Tán mất -${qiLoss} Nhân Khí.`);
            }

            if (player && typeof player.recalculateStats === "function") {
                player.recalculateStats();
            }

            return {
                droppedSubStage: droppedSubStage,
                newRealmName: this.getRealmDisplayName(),
                details: details,
                summary: details.join(" ")
            };
        }

        getTotalImmortalEssenceInRank6() {
            return (
                this.immortalEssence[6] * 1 +
                this.immortalEssence[7] * 100 +
                this.immortalEssence[8] * 10000 +
                this.immortalEssence[9] * 1000000
            );
        }

        // =====================================================================
        // 8. TRUY VẤN THÔNG TIN HIỂN THỊ CHO UIMANAGER
        // =====================================================================

        getRealmDisplayName() {
            if (!this.isAwakened) return "Phàm Nhân (Chưa Khai Khiếu)";
            if (this.isPseudoVenerable()) {
                return "Á Tiên Tôn (Bát Chuyển Cực Hạn)";
            }

            const sName = MORTAL_SUBSTAGES[this.subStage] ? MORTAL_SUBSTAGES[this.subStage].name : "Sơ Giai";

            if (this.isImmortal) {
                const rankCfg = IMMORTAL_RANKS[this.rank] || IMMORTAL_RANKS[6];
                const daoLordTag = (this.rank >= 9 && this.daoLordPath) ? ` — 👑 ${this.daoLordPath} Đạo Chủ` : "";
                return `${rankCfg.name} ${sName} (${rankCfg.titleSuffix})${daoLordTag}`;
            }

            const rName = MORTAL_RANKS[this.rank] ? MORTAL_RANKS[this.rank].name : "Nhất Chuyển";
            return `${rName} ${sName}`;
        }

        getApertureWallName() {
            if (!this.isAwakened) return "Chưa mở khiếu";
            if (this.isImmortal) return this.immortalAperture.gradeName;
            return MORTAL_SUBSTAGES[this.subStage] ? MORTAL_SUBSTAGES[this.subStage].wallName : "Khinh Mạc";
        }

        getEssenceQualityName() {
            if (!this.isAwakened) return "Không có";
            if (this.isImmortal) return IMMORTAL_RANKS[this.rank].essenceName;
            return MORTAL_RANKS[this.rank].essenceName;
        }

        getEssenceCssClass() {
            if (this.isImmortal) return IMMORTAL_RANKS[this.rank].cssClass;
            return MORTAL_RANKS[this.rank].cssClass;
        }

        // =====================================================================
        // 9. DỰNG HÌNH CANVAS CHO NGHI THỨC KHAI KHIẾU, KHÔNG KHIẾU & TIÊN KHIẾU
        // =====================================================================

        renderRitualCanvas(ctx) {
            if (!ctx) return;
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            const step = this.ritualState.currentStep || 1;
            const t = this.ritualState.animTick || 0;
            const cx = w / 2;
            const cy = h / 2;

            const bgGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, w * 0.72);
            bgGrad.addColorStop(0, step >= 4 ? "#162d38" : "#112233");
            bgGrad.addColorStop(1, "#05070a");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            if (step <= 3) {
                // Dòng suối ngầm Tinh Hà Điện & ánh sáng Hy Vọng Cổ
                const riverGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
                riverGrad.addColorStop(0, "rgba(56, 201, 146, 0.28)");
                riverGrad.addColorStop(1, "rgba(12, 46, 56, 0.75)");
                ctx.fillStyle = riverGrad;
                ctx.fillRect(0, h * 0.56, w, h * 0.44);

                // Sóng nước lấp lánh
                ctx.strokeStyle = "rgba(126, 247, 240, 0.25)";
                ctx.lineWidth = 1.5;
                for (let row = 0; row < 3; row++) {
                    ctx.beginPath();
                    const baseY = h * (0.64 + row * 0.12);
                    for (let x = 0; x <= w; x += 14) {
                        const y = baseY + Math.sin(x * 0.04 + t * 2.5 + row) * 3;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }

                // Bóng người đứng trong dòng suối (khi bước 2-3 tiến vào giữa dòng)
                const personY = step === 1 ? h * 0.42 : h * 0.52;
                ctx.save();
                ctx.fillStyle = "rgba(226, 191, 117, 0.22)";
                ctx.beginPath();
                ctx.arc(cx, personY + 8, 22 + Math.sin(t * 3) * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#18202c";
                ctx.fillRect(cx - 9, personY - 4, 18, 30);
                ctx.fillStyle = "#e0be77";
                ctx.fillRect(cx - 9, personY + 7, 18, 3);
                ctx.fillStyle = "#edd2b5";
                ctx.beginPath();
                ctx.arc(cx, personY - 12, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Đàn Hy Vọng Cổ bay lượn (Bước 3 hội tụ thẳng vào đan điền!)
                for (const p of this.ritualState.particles) {
                    if (step === 3) {
                        const dx = cx - p.x;
                        const dy = (personY + 8) - p.y;
                        p.x += dx * 0.025 + p.vx;
                        p.y += dy * 0.025 + p.vy * 0.4;
                        if (Math.hypot(dx, dy) < 8) {
                            p.x = Math.random() * w;
                            p.y = h - 8;
                        }
                    } else {
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.y < 10) p.y = h - 10;
                        if (p.x < 0) p.x = w;
                        if (p.x > w) p.x = 0;
                    }

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 223, 128, ${p.alpha})`;
                    ctx.fill();
                }
            } else {
                const radius = 72;

                // Vòng hào quang phá vỡ hư không
                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, radius + 12 + Math.sin(t * 4) * 3, 0, Math.PI * 2);
                ctx.strokeStyle = this.ritualState.rolledAptitude?.physique
                    ? "rgba(255, 82, 82, 0.45)"
                    : "rgba(56, 201, 146, 0.38)";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.clip();

                ctx.fillStyle = "#080c12";
                ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

                const targetPct = this.ritualState.rolledAptitude
                    ? this.ritualState.rolledAptitude.maxSeaPercent / 100
                    : 0.5;
                const fillRatio = step === 4 ? targetPct * 0.35 : (step === 5 ? targetPct * 0.72 : targetPct);
                const seaHeight = radius * 2 * fillRatio;
                const seaTopY = cy + radius - seaHeight;

                const seaGrad = ctx.createLinearGradient(0, seaTopY, 0, cy + radius);
                seaGrad.addColorStop(0, "#38c992");
                seaGrad.addColorStop(1, "#0d3b2a");

                ctx.fillStyle = seaGrad;
                ctx.beginPath();
                ctx.moveTo(cx - radius, cy + radius);
                for (let x = -radius; x <= radius; x += 8) {
                    const yWave = seaTopY + Math.sin(x * 0.06 + t * 3.2) * 3.5;
                    ctx.lineTo(cx + x, yWave);
                }
                ctx.lineTo(cx + radius, cy + radius);
                ctx.closePath();
                ctx.fill();

                // Hào quang Cổ Bản Mệnh ở bước 6-7
                if (step >= 6) {
                    const orbY = cy - 16 + Math.sin(t * 3) * 4;
                    ctx.beginPath();
                    ctx.arc(cx, orbY, 10, 0, Math.PI * 2);
                    ctx.fillStyle = "#ffd700";
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                ctx.restore();

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.lineWidth = 4;
                ctx.strokeStyle = this.ritualState.rolledAptitude?.physique ? "#ff5c5c" : "#e3c178";
                ctx.stroke();

                if (step >= 6 && this.ritualState.rolledAptitude) {
                    ctx.fillStyle = "#ffd700";
                    ctx.font = "bold 12px Georgia";
                    ctx.textAlign = "center";
                    ctx.fillText(
                        `${this.ritualState.rolledAptitude.maxSeaPercent}% Biển Nguyên`,
                        cx,
                        cy + radius + 16
                    );
                }
            }
        }

        renderApertureCanvas(ctx) {
            if (!ctx) return;
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const r = Math.min(w, h) * 0.40;
            const t = performance.now() * 0.002;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "#06080b";
            ctx.fillRect(0, 0, w, h);

            if (!this.isAwakened) {
                ctx.fillStyle = "#968f83";
                ctx.font = "13px Georgia";
                ctx.textAlign = "center";
                ctx.fillText("Chưa Khai Khiếu", cx, cy);
                return;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = this.isImmortal ? "#10212b" : "#090d14";
            ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

            if (!this.isImmortal) {
                const pct = Math.max(0, Math.min(100, this.currentEssence)) / 100;
                const seaH = r * 2 * pct;
                const topY = cy + r - seaH;
                const rankCfg = MORTAL_RANKS[this.rank] || MORTAL_RANKS[1];

                const grad = ctx.createLinearGradient(0, topY, 0, cy + r);
                grad.addColorStop(0, rankCfg.colorSecondary);
                grad.addColorStop(1, rankCfg.colorPrimary);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(cx - r, cy + r);
                for (let x = -r; x <= r; x += 8) {
                    const yWave = topY + Math.sin(x * 0.06 + t * 2.2) * 3.5;
                    ctx.lineTo(cx + x, yWave);
                }
                ctx.lineTo(cx + r, cy + r);
                ctx.closePath();
                ctx.fill();

                const capY = cy + r - (r * 2 * (this.aptitude.maxSeaPercent / 100));
                ctx.strokeStyle = "rgba(224, 190, 119, 0.55)";
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(cx - r, capY);
                ctx.lineTo(cx + r, capY);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                ctx.fillStyle = "#1f4732";
                ctx.fillRect(cx - r, cy + 10, r * 2, r);
                ctx.fillStyle = IMMORTAL_RANKS[this.rank]?.colorPrimary || "#4cd964";
                ctx.beginPath();
                ctx.arc(cx, cy - 18, 14, 0, Math.PI * 2);
                ctx.fill();
            }

            const guY = cy - 12 + Math.sin(t * 2.5) * 5;
            ctx.beginPath();
            ctx.arc(cx, guY, 9, 0, Math.PI * 2);
            ctx.fillStyle = "#e0be77";
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.lineWidth = 3 + this.subStage * 1.2;
            ctx.strokeStyle = this.wallPressure > 80 ? "#e05252" : "#b89758";
            ctx.stroke();
        }

        renderImmortalApertureMap(ctx) {
            if (!ctx) return;
            const w = ctx.canvas.width;
            const h = ctx.canvas.height;

            ctx.fillStyle = "#080b10";
            ctx.fillRect(0, 0, w, h);

            if (!this.isImmortal || !this.immortalAperture.active) {
                ctx.fillStyle = "#e0be77";
                ctx.font = "bold 13px Georgia";
                ctx.textAlign = "center";
                ctx.fillText("CHƯA MỞ TIÊN KHIẾU (CẦN ĐẠT NGŨ CHUYỂN ĐỈNH PHONG)", w / 2, h / 2 - 10);
                ctx.fillStyle = "#968f83";
                ctx.font = "12px Georgia";
                ctx.fillText(
                    `Hiện tại: ${this.getRealmDisplayName()} | Nhân Khí: ${Math.floor(this.humanQi)}/${MIN_ASCENSION_HUMAN_QI}`,
                    w / 2,
                    h / 2 + 14
                );
                return;
            }

            const ap = this.immortalAperture;
            const passed = ap.subStageTribulationsPassed || 0;
            const req = ap.subStageTribulationsRequired || this.getManualTribulationRequirements().tribulationsNeededForNextStage;

            const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
            grad.addColorStop(0, "#163026");
            grad.addColorStop(1, "#091217");
            ctx.fillStyle = grad;
            ctx.fillRect(8, 8, w - 16, h - 16);

            ctx.strokeStyle = "#b89758";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(8, 8, w - 16, h - 16);

            const nodes = ap.environmentNodes || [];
            nodes.forEach((node, idx) => {
                const nx = node.normX ? node.normX * w : (40 + (idx % 5) * 58);
                const ny = node.normY ? node.normY * h : (idx < 5 ? h * 0.58 : h * 0.82);

                ctx.beginPath();
                ctx.arc(nx, ny, 9, 0, Math.PI * 2);
                ctx.fillStyle = node.color || "#4cd964";
                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.stroke();

                ctx.fillStyle = "#e6dfd5";
                ctx.font = "10px Georgia";
                ctx.textAlign = "center";
                ctx.fillText(node.name, nx, ny + 18);
            });

            ctx.fillStyle = "rgba(8, 12, 18, 0.90)";
            ctx.fillRect(14, 12, w - 28, 54);
            ctx.strokeStyle = "#5e4f38";
            ctx.strokeRect(14, 12, w - 28, 54);

            ctx.fillStyle = "#e0be77";
            ctx.font = "bold 12px Georgia";
            ctx.textAlign = "left";
            ctx.fillText(`${ap.gradeName} (${ap.spaceAcres} mẫu) — ${this.getRealmDisplayName()}`, 22, 29);

            ctx.fillStyle = "#5cc995";
            ctx.font = "11px Georgia";
            const subLineText = this.isPseudoVenerable()
                ? `Vạn Kiếp Thành Tôn: ${ap.myriadTribulationsPassed || 0}/3 | Phong Tỏa Thiên Đạo: ${this.daoBlockadeBroken ? "Đã Phá" : "Chưa Phá"}`
                : (this.rank >= 9 && this.daoLordPath
                    ? `👑 Đạo Chủ ${this.daoLordPath} | Đạo Ngân Tự Nhiên: ${(this.naturalDaoMarksRefined || 0).toLocaleString("vi-VN")}`
                    : `Tiến độ Tiểu Cảnh Giới: ${passed}/${req} Tai Kiếp | Tổng đã độ: ${ap.heavenlyTribulationsPassed} Kiếp`);
            ctx.fillText(subLineText, 22, 48);
        }

        // =====================================================================
        // 10. LƯU & KHÔI PHỤC DỮ LIỆU
        // =====================================================================

        toSaveData() {
            return {
                isAwakened: this.isAwakened,
                isImmortal: this.isImmortal,
                aptitude: this.aptitude,
                rank: this.rank,
                subStage: this.subStage,
                currentEssence: this.currentEssence,
                wallProgress: this.wallProgress,
                maxWallProgress: this.maxWallProgress,
                wallPressure: this.wallPressure,
                wallIntegrity: this.wallIntegrity,
                hasExploded: this.hasExploded,
                tenExtremeSealed: this.tenExtremeSealed,
                pressureFreezeTimer: this.pressureFreezeTimer,
                daoBlockadeBroken: this.daoBlockadeBroken,
                daoLordPath: this.daoLordPath,
                naturalDaoMarksRefined: this.naturalDaoMarksRefined,
                vitalGuId: this.vitalGuId,
                vitalGuName: this.vitalGuName,
                humanQi: this.humanQi,
                immortalEssence: this.immortalEssence,
                immortalAperture: this.immortalAperture,
                ascensionState: this.ascensionState
            };
        }

        fromSaveData(data) {
            if (!data) return;
            this.isAwakened = Boolean(data.isAwakened);
            this.isImmortal = Boolean(data.isImmortal);
            if (data.aptitude) this.aptitude = { ...this.aptitude, ...data.aptitude };
            if (typeof data.rank === "number") this.rank = data.rank;
            if (typeof data.subStage === "number") { const maxSub = (this.isImmortal && this.rank === 8) ? 4 : 3; this.subStage = Math.min(maxSub, Math.max(0, data.subStage)); }
            if (typeof data.currentEssence === "number") this.currentEssence = data.currentEssence;
            if (typeof data.wallProgress === "number") this.wallProgress = data.wallProgress;

            // Tự động áp dụng mốc yêu cầu Khiếu Bích mới ngay cả khi tải file lưu cũ
            if (!this.isImmortal) {
                const rankCfg = MORTAL_RANKS[this.rank] || MORTAL_RANKS[1];
                const subCfg = MORTAL_SUBSTAGES[this.subStage] || MORTAL_SUBSTAGES[0];
                this.maxWallProgress = Math.round(rankCfg.baseWallReq * subCfg.statMult);
            } else if (typeof data.maxWallProgress === "number") {
                this.maxWallProgress = data.maxWallProgress;
            }

            if (typeof data.wallPressure === "number") this.wallPressure = data.wallPressure;
            if (typeof data.wallIntegrity === "number") this.wallIntegrity = data.wallIntegrity;
            this.hasExploded = Boolean(data.hasExploded);
            this.tenExtremeSealed = Boolean(data.tenExtremeSealed);
            this.pressureFreezeTimer = typeof data.pressureFreezeTimer === "number" ? Math.max(0, data.pressureFreezeTimer) : 0;
            this.daoBlockadeBroken = Boolean(data.daoBlockadeBroken);
            this.daoLordPath = data.daoLordPath || (this.isImmortal && this.rank >= 9 ? "Trí Đạo" : null);
            this.naturalDaoMarksRefined = typeof data.naturalDaoMarksRefined === "number" ? data.naturalDaoMarksRefined : (this.isImmortal && this.rank >= 9 ? 50000 : 0);
            if (data.vitalGuId) this.vitalGuId = data.vitalGuId;
            if (data.vitalGuName) this.vitalGuName = data.vitalGuName;
            if (typeof data.humanQi === "number") this.humanQi = data.humanQi;
            if (data.immortalEssence) this.immortalEssence = { ...this.immortalEssence, ...data.immortalEssence };
            if (data.immortalAperture) {
                this.immortalAperture = { ...this.immortalAperture, ...data.immortalAperture };
                if (typeof this.immortalAperture.subStageTribulationsPassed !== "number") {
                    this.immortalAperture.subStageTribulationsPassed = 0;
                }
                this.immortalAperture.subStageTribulationsRequired = this.getManualTribulationRequirements().tribulationsNeededForNextStage;
                if (this.isImmortal) {
                    this.maxWallProgress = this.immortalAperture.subStageTribulationsRequired;
                }
            }
            if (data.ascensionState) this.ascensionState = { ...this.ascensionState, ...data.ascensionState };
        }
    }

    ApertureSystem.MIN_ASCENSION_HUMAN_QI = MIN_ASCENSION_HUMAN_QI;
    ApertureSystem.VENERABLE_REQ_DAO_MARKS = VENERABLE_REQ_DAO_MARKS;
    ApertureSystem.VENERABLE_REQ_MYRIAD_TRIBULATIONS = VENERABLE_REQ_MYRIAD_TRIBULATIONS;
    ApertureSystem.APTITUDE_TIERS = APTITUDE_TIERS;
    ApertureSystem.TEN_EXTREME_PHYSIQUES = TEN_EXTREME_PHYSIQUES;
    ApertureSystem.MORTAL_SUBSTAGES = MORTAL_SUBSTAGES;
    ApertureSystem.MORTAL_RANKS = MORTAL_RANKS;
    ApertureSystem.IMMORTAL_RANKS = IMMORTAL_RANKS;
    ApertureSystem.BLESSED_LAND_GRADES = BLESSED_LAND_GRADES;

    global.ApertureSystem = ApertureSystem;

})(window);